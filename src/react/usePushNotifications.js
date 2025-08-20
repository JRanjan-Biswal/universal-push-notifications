import { useState, useEffect, useCallback, useRef } from 'react';
import PushNotificationManager from '../PushNotificationManager.js';

const usePushNotifications = (config = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const managerRef = useRef(null);

  useEffect(() => {
    managerRef.current = new PushNotificationManager(config);
    setIsSupported(managerRef.current.isSupported);
    
    if (managerRef.current.isSupported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const existingSub = await managerRef.current.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const subscribe = useCallback(async () => {
    if (!managerRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sub = await managerRef.current.subscribe();
      setSubscription(sub);
      setIsSubscribed(true);
      setPermission('granted');
    } catch (err) {
      setError(err.message);
      setPermission(Notification.permission);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!managerRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await managerRef.current.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const showTestNotification = useCallback(async (title, options) => {
    if (!managerRef.current) return;
    
    try {
      await managerRef.current.showTestNotification(title, options);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    isSupported,
    subscription,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    showTestNotification,
    clearError: () => setError(null)
  };
};

export default usePushNotifications;