class PushNotificationManager {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/notifications',
      swPath: config.swPath || '/sw.js',
      debug: config.debug || false,
      ...config
    };
    
    this.subscription = null;
    this.isSupported = this.checkSupport();
    this.registration = null;
    
    if (this.config.debug) {
      console.log('PushNotificationManager initialized', this.config);
    }
  }

  checkSupport() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      throw new Error('Push notification permission denied');
    }
    
    return permission;
  }

  async registerServiceWorker() {
    if (!this.isSupported) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register(this.config.swPath);
      
      if (this.config.debug) {
        console.log('Service Worker registered successfully');
      }
      
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  async getPublicKey() {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/vapid-public-key`);
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw error;
    }
  }

  async subscribe() {
    try {
      await this.requestPermission();
      
      if (!this.registration) {
        await this.registerServiceWorker();
      }

      const publicKey = await this.getPublicKey();
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      if (this.config.debug) {
        console.log('Push subscription successful');
      }
      
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      return false;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Notify server about unsubscription
      await this.removeSubscriptionFromServer(this.subscription);
      
      this.subscription = null;
      
      if (this.config.debug) {
        console.log('Successfully unsubscribed');
      }
      
      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      return false;
    }
  }

  async getSubscription() {
    if (!this.registration) {
      return null;
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification (local)
  async showTestNotification(title = 'Test Notification', options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: 'This is a test notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    }
  }
}

export default PushNotificationManager;