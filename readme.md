# Universal Push Notifications

A secure, universal push notification package for React.js and Vue.js applications with server-side environment variable protection.

## Features

- 🔒 **Secure**: Environment variables kept server-side
- ⚛️ **React Support**: Custom hook with TypeScript support
- 🟢 **Vue Support**: Composable API for Vue 2 & 3
- 🚀 **Easy Setup**: Simple configuration and setup
- 📱 **PWA Ready**: Service worker included
- 🔧 **Customizable**: Flexible configuration options
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install universal-push-notifications
# or
yarn add universal-push-notifications
```

## Quick Start

### 1. Generate VAPID Keys

```javascript
const { NotificationServer } = require('universal-push-notifications');

// Generate keys (run once, store securely)
const vapidKeys = NotificationServer.generateVapidKeys();
console.log(vapidKeys);
// Save these to your environment variables
```

### 2. Server Setup (Express.js)

```javascript
const express = require('express');
const { NotificationServer } = require('universal-push-notifications');

const app = express();
app.use(express.json());

const notificationServer = new NotificationServer({
  vapidKeys: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  },
  vapidDetails: {
    subject: 'mailto:your-email@example.com'
  }
});

const middleware = notificationServer.createMiddleware();

app.get('/api/notifications/vapid-public-key', middleware.getVapidPublicKey);
app.post('/api/notifications/subscribe', middleware.subscribe);
app.post('/api/notifications/unsubscribe', middleware.unsubscribe);
app.post('/api/notifications/send', middleware.sendNotification);

app.listen(3000);
```

### 3. Copy Service Worker

Copy the service worker to your public folder:

```bash
cp node_modules/universal-push-notifications/public/sw.js public/
```

### 4. React Usage

```jsx
import React from 'react';
import { usePushNotifications } from 'universal-push-notifications';

function NotificationComponent() {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    showTestNotification
  } = usePushNotifications({
    apiEndpoint: '/api/notifications',
    debug: true
  });

  if (!isSupported) {
    return <div>Push notifications not supported</div>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      <p>Permission: {{ state.permission }}</p>
    <p>Subscribed: {{ isSubscribed ? 'Yes' : 'No' }}</p>
    
    <p v-if="state.error" style="color: red">Error: {{ state.error }}</p>
    
    <button 
      @click="subscribe" 
      :disabled="state.loading || isSubscribed"
    >
      {{ state.loading ? 'Loading...' : 'Subscribe' }}
    </button>
    
    <button 
      @click="unsubscribe" 
      :disabled="state.loading || !isSubscribed"
    >
      {{ state.loading ? 'Loading...' : 'Unsubscribe' }}
    </button>
    
    <button 
      @click="() => showTestNotification('Test', { body: 'This is a test!' })"
      :disabled="!isSubscribed"
    >
      Test Notification
    </button>
  </div>
</template>

<script>
import { createPushNotifications } from 'universal-push-notifications';

export default {
  setup() {
    const {
      state,
      isSubscribed,
      subscribe,
      unsubscribe,
      showTestNotification
    } = createPushNotifications({
      apiEndpoint: '/api/notifications',
      debug: true
    });

    return {
      state,
      isSubscribed,
      subscribe,
      unsubscribe,
      showTestNotification
    };
  }
};
</script>
```

### 6. Vue 2 Usage

```vue
<template>
  <div v-if="!isSupported">
    Push notifications not supported
  </div>
  
  <div v-else>
    <h3>Push Notifications</h3>
    <p>Permission: {{ permission }}</p>
    <p>Subscribed: {{ isSubscribed ? 'Yes' : 'No' }}</p>
    
    <p v-if="error" style="color: red">Error: {{ error }}</p>
    
    <button 
      @click="subscribe" 
      :disabled="loading || isSubscribed"
    >
      {{ loading ? 'Loading...' : 'Subscribe' }}
    </button>
    
    <button 
      @click="unsubscribe" 
      :disabled="loading || !isSubscribed"
    >
      {{ loading ? 'Loading...' : 'Unsubscribe' }}
    </button>
    
    <button 
      @click="() => showTestNotification('Test', { body: 'This is a test!' })"
      :disabled="!isSubscribed"
    >
      Test Notification
    </button>
  </div>
</template>

<script>
import { createPushNotificationsVue2 } from 'universal-push-notifications';

export default createPushNotificationsVue2({
  apiEndpoint: '/api/notifications',
  debug: true
});
</script>
```

### 7. Send Notifications from Server

```javascript
// Send to all subscribers
fetch('http://localhost:3000/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Hello World!',
    body: 'This is a push notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: { url: '/dashboard', userId: 123 },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  })
});
```

## Configuration Options

### Client Configuration

```javascript
const config = {
  apiEndpoint: '/api/notifications',    // API endpoint base path
  swPath: '/sw.js',                    // Service worker path
  debug: false                         // Enable debug logging
};
```

### Server Configuration

```javascript
const notificationServer = new NotificationServer({
  vapidKeys: {
    publicKey: 'YOUR_PUBLIC_KEY',
    privateKey: 'YOUR_PRIVATE_KEY'
  },
  vapidDetails: {
    subject: 'mailto:your-email@example.com'  // or 'https://yoursite.com'
  }
});
```

## API Reference

### React Hook: `usePushNotifications(config)`

Returns an object with:
- `isSupported`: boolean - Browser support
- `subscription`: PushSubscription | null - Current subscription
- `isSubscribed`: boolean - Subscription status
- `permission`: NotificationPermission - Current permission
- `loading`: boolean - Loading state
- `error`: string | null - Error message
- `subscribe()`: Function to subscribe
- `unsubscribe()`: Function to unsubscribe
- `showTestNotification(title, options)`: Show test notification
- `clearError()`: Clear error state

### Vue Composable: `createPushNotifications(config)`

Returns an object with:
- `state`: Reactive state object
- `isSubscribed`: Computed subscription status
- `subscribe()`: Function to subscribe
- `unsubscribe()`: Function to unsubscribe
- `showTestNotification(title, options)`: Show test notification
- `clearError()`: Clear error state
- `initialize()`: Manual initialization

### Server Class: `NotificationServer`

Methods:
- `static generateVapidKeys()`: Generate VAPID key pair
- `createMiddleware()`: Create Express middleware
- `getAllSubscriptions()`: Get all subscriptions
- `getSubscriptionCount()`: Get subscriber count

## Environment Variables

```bash
# Required VAPID keys (keep these secret!)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# Optional
NODE_ENV=production
```

## Security Features

✅ **Environment Variables Protected**: VAPID private keys never exposed to client
✅ **Secure API Endpoints**: Proper validation and error handling
✅ **HTTPS Required**: Push notifications require HTTPS in production
✅ **Origin Validation**: Service worker validates notification origin
✅ **Subscription Management**: Automatic cleanup of invalid subscriptions

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ iOS 16.4+ / macOS 13+
- Opera: ✅ Full support

## Troubleshooting

### Common Issues

1. **Notifications not showing**: Check browser permissions and HTTPS
2. **Service worker not registering**: Verify file path and HTTPS
3. **VAPID errors**: Ensure keys are correctly set in environment
4. **Cross-origin issues**: Check CORS settings on your server

### Debug Mode

Enable debug logging:

```javascript
const notifications = usePushNotifications({ debug: true });
```

## Examples

Check the `examples/` directory for complete working examples:
- `examples/react-example/` - Complete React app
- `examples/vue-example/` - Complete Vue app
- `examples/server-example/` - Express.js server setup

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License
