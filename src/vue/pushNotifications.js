import { reactive, computed, onMounted } from 'vue';
import PushNotificationManager from '../PushNotificationManager.js';

const createPushNotifications = (config = {}) => {
  const state = reactive({
    isSupported: false,
    subscription: null,
    permission: 'default',
    loading: false,
    error: null
  });

  let manager = null;

  const isSubscribed = computed(() => !!state.subscription);

  const initialize = async () => {
    manager = new PushNotificationManager(config);
    state.isSupported = manager.isSupported;
    
    if (manager.isSupported) {
      state.permission = Notification.permission;
      await checkExistingSubscription();
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const existingSub = await manager.getSubscription();
      if (existingSub) {
        state.subscription = existingSub;
      }
    } catch (err) {
      state.error = err.message;
    }
  };

  const subscribe = async () => {
    if (!manager) return;
    
    state.loading = true;
    state.error = null;
    
    try {
      const sub = await manager.subscribe();
      state.subscription = sub;
      state.permission = 'granted';
    } catch (err) {
      state.error = err.message;
      state.permission = Notification.permission;
    } finally {
      state.loading = false;
    }
  };

  const unsubscribe = async () => {
    if (!manager) return;
    
    state.loading = true;
    state.error = null;
    
    try {
      await manager.unsubscribe();
      state.subscription = null;
    } catch (err) {
      state.error = err.message;
    } finally {
      state.loading = false;
    }
  };

  const showTestNotification = async (title, options) => {
    if (!manager) return;
    
    try {
      await manager.showTestNotification(title, options);
    } catch (err) {
      state.error = err.message;
    }
  };

  const clearError = () => {
    state.error = null;
  };

  // Auto-initialize
  onMounted(initialize);

  return {
    state,
    isSubscribed,
    subscribe,
    unsubscribe,
    showTestNotification,
    clearError,
    initialize
  };
};

// Vue 2 compatibility
const createPushNotificationsVue2 = (config = {}) => {
  return {
    data() {
      return {
        isSupported: false,
        subscription: null,
        permission: 'default',
        loading: false,
        error: null,
        manager: null
      };
    },
    
    computed: {
      isSubscribed() {
        return !!this.subscription;
      }
    },
    
    async mounted() {
      await this.initialize();
    },
    
    methods: {
      async initialize() {
        this.manager = new PushNotificationManager(config);
        this.isSupported = this.manager.isSupported;
        
        if (this.manager.isSupported) {
          this.permission = Notification.permission;
          await this.checkExistingSubscription();
        }
      },
      
      async checkExistingSubscription() {
        try {
          const existingSub = await this.manager.getSubscription();
          if (existingSub) {
            this.subscription = existingSub;
          }
        } catch (err) {
          this.error = err.message;
        }
      },
      
      async subscribe() {
        if (!this.manager) return;
        
        this.loading = true;
        this.error = null;
        
        try {
          const sub = await this.manager.subscribe();
          this.subscription = sub;
          this.permission = 'granted';
        } catch (err) {
          this.error = err.message;
          this.permission = Notification.permission;
        } finally {
          this.loading = false;
        }
      },
      
      async unsubscribe() {
        if (!this.manager) return;
        
        this.loading = true;
        this.error = null;
        
        try {
          await this.manager.unsubscribe();
          this.subscription = null;
        } catch (err) {
          this.error = err.message;
        } finally {
          this.loading = false;
        }
      },
      
      async showTestNotification(title, options) {
        if (!this.manager) return;
        
        try {
          await this.manager.showTestNotification(title, options);
        } catch (err) {
          this.error = err.message;
        }
      },
      
      clearError() {
        this.error = null;
      }
    }
  };
};

export default createPushNotifications;
export { createPushNotificationsVue2 };