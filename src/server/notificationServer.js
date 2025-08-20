const webpush = require('web-push');

export class NotificationServer {
  constructor(options = {}) {
    this.vapidKeys = options.vapidKeys;
    this.vapidDetails = options.vapidDetails;
    this.subscriptions = new Map(); // In production, use a database
    
    if (!this.vapidKeys || !this.vapidDetails) {
      throw new Error('VAPID keys and details are required');
    }
    
    webpush.setVapidDetails(
      this.vapidDetails.subject,
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
  }

  // Generate VAPID keys (run this once and store securely)
  static generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }

  // Express.js middleware factory
  createMiddleware() {
    return {
      // GET /api/notifications/vapid-public-key
      getVapidPublicKey: (req, res) => {
        res.json({ publicKey: this.vapidKeys.publicKey });
      },

      // POST /api/notifications/subscribe
      subscribe: (req, res) => {
        try {
          const { subscription, userAgent, timestamp } = req.body;
          
          if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' });
          }

          const subscriptionData = {
            subscription,
            userAgent,
            timestamp,
            subscriptionId: this.generateSubscriptionId(subscription)
          };

          this.subscriptions.set(subscription.endpoint, subscriptionData);
          
          res.json({ 
            success: true, 
            subscriptionId: subscriptionData.subscriptionId 
          });
        } catch (error) {
          console.error('Subscription error:', error);
          res.status(500).json({ error: 'Subscription failed' });
        }
      },

      // POST /api/notifications/unsubscribe
      unsubscribe: (req, res) => {
        try {
          const { subscription } = req.body;
          
          if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' });
          }

          this.subscriptions.delete(subscription.endpoint);
          
          res.json({ success: true });
        } catch (error) {
          console.error('Unsubscribe error:', error);
          res.status(500).json({ error: 'Unsubscribe failed' });
        }
      },

      // POST /api/notifications/send
      sendNotification: async (req, res) => {
        try {
          const { 
            title, 
            body, 
            icon, 
            badge, 
            data, 
            actions, 
            tag,
            targetEndpoint // Optional: send to specific subscription
          } = req.body;

          if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
          }

          const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icon-192x192.png',
            badge: badge || '/badge-72x72.png',
            data: data || {},
            actions: actions || [],
            tag: tag || Date.now().toString()
          });

          const results = await this.sendToSubscriptions(payload, targetEndpoint);
          
          res.json({ 
            success: true, 
            results,
            sent: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          });
        } catch (error) {
          console.error('Send notification error:', error);
          res.status(500).json({ error: 'Failed to send notifications' });
        }
      }
    };
  }

  async sendToSubscriptions(payload, targetEndpoint = null) {
    const results = [];
    
    const subscriptionsToSend = targetEndpoint 
      ? [this.subscriptions.get(targetEndpoint)].filter(Boolean)
      : Array.from(this.subscriptions.values());

    for (const subData of subscriptionsToSend) {
      try {
        await webpush.sendNotification(subData.subscription, payload);
        results.push({ 
          endpoint: subData.subscription.endpoint, 
          success: true 
        });
      } catch (error) {
        console.error('Push send error:', error);
        
        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          this.subscriptions.delete(subData.subscription.endpoint);
        }
        
        results.push({ 
          endpoint: subData.subscription.endpoint, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  generateSubscriptionId(subscription) {
    return Buffer.from(subscription.endpoint).toString('base64').slice(-12);
  }

  // Get all subscriptions (for admin purposes)
  getAllSubscriptions() {
    return Array.from(this.subscriptions.values());
  }

  // Get subscription count
  getSubscriptionCount() {
    return this.subscriptions.size;
  }
}
