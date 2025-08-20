<template>
  <div class="app">
    <h1>Push Notifications Demo - Vue 3</h1>
    
    <div v-if="!state.isSupported" class="error">
      ❌ Push notifications are not supported in this browser
    </div>
    
    <div v-else>
      <div class="status">
        <h3>Status</h3>
        <p>🔒 Permission: <strong>{{ state.permission }}</strong></p>
        <p>📱 Subscribed: <strong>{{ isSubscribed ? 'Yes' : 'No' }}</strong></p>
        <p v-if="state.loading">⏳ Loading...</p>
      </div>

      <div v-if="state.error" class="error">
        ❌ Error: {{ state.error }}
        <button @click="clearError">Clear</button>
      </div>

      <div class="actions">
        <h3>Actions</h3>
        <button 
          @click="subscribe" 
          :disabled="state.loading || isSubscribed"
          class="subscribe-btn"
        >
          {{ state.loading ? '⏳ Loading...' : '🔔 Subscribe to Notifications' }}
        </button>
        
        <button 
          @click="unsubscribe" 
          :disabled="state.loading || !isSubscribed"
          class="unsubscribe-btn"
        >
          {{ state.loading ? '⏳ Loading...' : '🔕 Unsubscribe' }}
        </button>
      </div>

      <div v-if="isSubscribed" class="notification-test">
        <h3>Test Notifications</h3>
        
        <div class="form-group">
          <label>Title:</label>
          <input v-model="notificationData.title" type="text" />
        </div>
        
        <div class="form-group">
          <label>Body:</label>
          <textarea v-model="notificationData.body"></textarea>
        </div>
        
        <div class="form-group">
          <label>Icon URL:</label>
          <input v-model="notificationData.icon" type="text" />
        </div>

        <div class="test-buttons">
          <button @click="handleSendTestNotification" class="test-btn">
            📱 Send Local Test
          </button>
          
          <button @click="handleSendServerNotification" class="server-btn">
            🚀 Send Server Notification
          </button>
        </div>
      </div>

      <div class="info">
        <h3>ℹ️ Information</h3>
        <ul>
          <li>Make sure you're using HTTPS in production</li>
          <li>Service worker must be at the root level</li>
          <li>Check browser console for detailed logs</li>
          <li>Some browsers block notifications in incognito mode</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { createPushNotifications } from 'universal-push-notifications';

const notificationData = reactive({
  title: 'Test Notification',
  body: 'This is a test message',
  icon: '/icon-192x192.png'
});

const {
  state,
  isSubscribed,
  subscribe,
  unsubscribe,
  showTestNotification,
  clearError
} = createPushNotifications({
  apiEndpoint: '/api/notifications',
  debug: true
});

const handleSendTestNotification = async () => {
  await showTestNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon
  });
};

const handleSendServerNotification = async () => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });
    
    if (response.ok) {
      alert('Server notification sent!');
    }
  } catch (err) {
    alert('Failed to send server notification');
  }
};
</script>

<style>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.error {
  background: #fef2f2;
  color: #dc2626;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.actions {
  margin: 20px 0;
}

.subscribe-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  margin-right: 10px;
  cursor: pointer;
}

.subscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unsubscribe-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}

.unsubscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-test {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.form-group {
  margin: 15px 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.test-buttons {
  margin-top: 20px;
}

.test-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  margin-right: 10px;
  cursor: pointer;
}

.server-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.info {
  background: #fffbeb;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info li {
  margin: 5px 0;
}
</style>