const express = require('express');
const path = require('path');
const { NotificationServer } = require('universal-push-notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// VAPID Keys - In production, store these securely in environment variables
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI95RlzdH47wAelDfTH5jynjFUe-B3KFkRGz4AvRwKoHNvTmBPR0C4OkJNs',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'UxHI8CWbdYKyg8v6LLqO8j2Jl-dxu5PD3n4MCgLEWP8'
};

// Initialize notification server
const notificationServer = new NotificationServer({
  vapidKeys,
  vapidDetails: {
    subject: 'mailto:test@example.com' // Replace with your email or website
  }
});

// Create middleware
const middleware = notificationServer.createMiddleware();

// Routes
app.get('/api/notifications/vapid-public-key', middleware.getVapidPublicKey);
app.post('/api/notifications/subscribe', middleware.subscribe);
app.post('/api/notifications/unsubscribe', middleware.unsubscribe);
app.post('/api/notifications/send', middleware.sendNotification);

// Admin endpoints
app.get('/api/notifications/stats', (req, res) => {
  res.json({
    subscriptionCount: notificationServer.getSubscriptionCount(),
    subscriptions: notificationServer.getAllSubscriptions()
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📱 Push notification endpoints available:');
  console.log(`  GET  /api/notifications/vapid-public-key`);
  console.log(`  POST /api/notifications/subscribe`);
  console.log(`  POST /api/notifications/unsubscribe`);
  console.log(`  POST /api/notifications/send`);
  console.log(`  GET  /api/notifications/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// ===== scripts/build-server.js =====
const fs = require('fs');
const path = require('path');

// Build script for server components
console.log('Building server components...');

// Copy service worker to dist
const swSource = path.join(__dirname, '../public/sw.js');
const swDest = path.join(__dirname, '../dist/sw.js');

if (!fs.existsSync(path.dirname(swDest))) {
  fs.mkdirSync(path.dirname(swDest), { recursive: true });
}

fs.copyFileSync(swSource, swDest);

console.log('✅ Server build complete');