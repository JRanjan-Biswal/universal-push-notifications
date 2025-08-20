import React, { useState } from 'react';
import { usePushNotifications } from 'universal-push-notifications';
import './App.css';

function App() {
  const [notificationData, setNotificationData] = useState({
    title: 'Test Notification',
    body: 'This is a test message',
    icon: '/icon-192x192.png'
  });

  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    showTestNotification,
    clearError
  } = usePushNotifications({
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

  if (!isSupported) {
    return (
      <div className="app">
        <h1>Push Notifications Demo</h1>
        <div className="error">
          ❌ Push notifications are not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Push Notifications Demo - React</h1>
      
      <div className="status">
        <h3>Status</h3>
        <p>🔒 Permission: <strong>{permission}</strong></p>
        <p>📱 Subscribed: <strong>{isSubscribed ? 'Yes' : 'No'}</strong></p>
        {loading && <p>⏳ Loading...</p>}
      </div>

      {error && (
        <div className="error">
          ❌ Error: {error}
          <button onClick={clearError}>Clear</button>
        </div>
      )}

      <div className="actions">
        <h3>Actions</h3>
        <button 
          onClick={subscribe} 
          disabled={loading || isSubscribed}
          className="subscribe-btn"
        >
          {loading ? '⏳ Loading...' : '🔔 Subscribe to Notifications'}
        </button>
        
        <button 
          onClick={unsubscribe} 
          disabled={loading || !isSubscribed}
          className="unsubscribe-btn"
        >
          {loading ? '⏳ Loading...' : '🔕 Unsubscribe'}
        </button>
      </div>

      {isSubscribed && (
        <div className="notification-test">
          <h3>Test Notifications</h3>
          
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={notificationData.title}
              onChange={e => setNotificationData({...notificationData, title: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Body:</label>
            <textarea
              value={notificationData.body}
              onChange={e => setNotificationData({...notificationData, body: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Icon URL:</label>
            <input
              type="text"
              value={notificationData.icon}
              onChange={e => setNotificationData({...notificationData, icon: e.target.value})}
            />
          </div>

          <div className="test-buttons">
            <button onClick={handleSendTestNotification} className="test-btn">
              📱 Send Local Test
            </button>
            
            <button onClick={handleSendServerNotification} className="server-btn">
              🚀 Send Server Notification
            </button>
          </div>
        </div>
      )}

      <div className="info">
        <h3>ℹ️ Information</h3>
        <ul>
          <li>Make sure you're using HTTPS in production</li>
          <li>Service worker must be at the root level</li>
          <li>Check browser console for detailed logs</li>
          <li>Some browsers block notifications in incognito mode</li>
        </ul>
      </div>
    </div>
  );
}

export default App;