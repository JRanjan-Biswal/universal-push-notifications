declare module 'universal-push-notifications' {
  export interface PushNotificationConfig {
    apiEndpoint?: string;
    swPath?: string;
    debug?: boolean;
  }

  export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    actions?: NotificationAction[];
    tag?: string;
  }

  export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }

  export interface PushSubscriptionData {
    subscription: PushSubscription;
    userAgent?: string;
    timestamp?: number;
  }

  export class PushNotificationManager {
    constructor(config?: PushNotificationConfig);
    checkSupport(): boolean;
    requestPermission(): Promise<NotificationPermission>;
    subscribe(): Promise<PushSubscription>;
    unsubscribe(): Promise<boolean>;
    getSubscription(): Promise<PushSubscription | null>;
    showTestNotification(title?: string, options?: NotificationOptions): Promise<void>;
  }

  // React Hook
  export interface UsePushNotificationsReturn {
    isSupported: boolean;
    subscription: PushSubscription | null;
    isSubscribed: boolean;
    permission: NotificationPermission;
    loading: boolean;
    error: string | null;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    showTestNotification: (title?: string, options?: NotificationOptions) => Promise<void>;
    clearError: () => void;
  }

  export function usePushNotifications(config?: PushNotificationConfig): UsePushNotificationsReturn;

  // Vue Composable
  export interface PushNotificationsState {
    isSupported: boolean;
    subscription: PushSubscription | null;
    permission: NotificationPermission;
    loading: boolean;
    error: string | null;
  }

  export interface PushNotificationsComposable {
    state: PushNotificationsState;
    isSubscribed: ComputedRef<boolean>;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    showTestNotification: (title?: string, options?: NotificationOptions) => Promise<void>;
    clearError: () => void;
    initialize: () => Promise<void>;
  }

  export function createPushNotifications(config?: PushNotificationConfig): PushNotificationsComposable;
  export function createPushNotificationsVue2(config?: PushNotificationConfig): any;

  // Server
  export interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export interface VapidDetails {
    subject: string;
  }

  export interface NotificationServerOptions {
    vapidKeys: VapidKeys;
    vapidDetails: VapidDetails;
  }

  export class NotificationServer {
    constructor(options: NotificationServerOptions);
    static generateVapidKeys(): VapidKeys;
    createMiddleware(): any;
    getAllSubscriptions(): PushSubscriptionData[];
    getSubscriptionCount(): number;
  }
}