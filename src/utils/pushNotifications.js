/**
 * Push Notification Utilities
 * Handles notification permissions, subscription management, and notification display
 * 
 * BACKEND INTEGRATION REQUIRED:
 * - This module prepares the frontend for push notifications
 * - Backend needs to implement VAPID keys and push subscription management
 * - Backend endpoint required: POST /api/notifications/subscribe
 * - Backend will handle sending push notifications via web push protocol
 */

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your VAPID public key from backend

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[Push] This browser does not support notifications');
    return { granted: false, state: 'unsupported' };
  }

  if (Notification.permission === 'granted') {
    console.log('[Push] Notification permission already granted');
    return { granted: true, state: 'granted' };
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);
    return { granted: permission === 'granted', state: permission };
  }

  return { granted: false, state: 'denied' };
}

/**
 * Subscribe to push notifications
 * 
 * BACKEND INTEGRATION:
 * 1. Call this function after user grants permission
 * 2. Send the subscription object to your backend
 * 3. Backend should store it in database for sending notifications
 * 4. Use the subscription JSON for sending push notifications
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    console.log('[Push] Service workers not supported');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] Service worker ready');

    // Check if push manager is available
    if (!registration.pushManager) {
      console.log('[Push] Push manager not available');
      return null;
    }

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // If no subscription, create one
    if (!subscription) {
      console.log('[Push] Creating new push subscription');
      
      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    console.log('[Push] Push subscription obtained:', subscription);

    // TODO: Send subscription to backend
    // await fetch('/api/notifications/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // });

    return subscription;
  } catch (error) {
    console.error('[Push] Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 * 
 * BACKEND INTEGRATION:
 * 1. Call this when user disables notifications in settings
 * 2. Send the subscription to backend to remove it from database
 * 3. Backend should delete the subscription to stop sending notifications
 */
export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // TODO: Send unsubscribe request to backend
      // await fetch('/api/notifications/unsubscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription)
      // });

      await subscription.unsubscribe();
      console.log('[Push] Successfully unsubscribed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Push] Error unsubscribing:', error);
    return false;
  }
}

/**
 * Get current push subscription status
 */
export async function getPushSubscriptionStatus() {
  if (!('serviceWorker' in navigator)) {
    return { subscribed: false, permission: 'unsupported' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return {
      subscribed: !!subscription,
      permission: Notification.permission,
      subscription: subscription
    };
  } catch (error) {
    console.error('[Push] Error getting subscription status:', error);
    return { subscribed: false, permission: 'error' };
  }
}

/**
 * Show a local notification (for testing or in-app notifications)
 */
export function showLocalNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.log('[Push] Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
}

/**
 * Convert URL base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Initialize push notifications
 * Call this when user enables notifications in settings
 */
export async function initializePushNotifications() {
  console.log('[Push] Initializing push notifications');
  
  // Request permission
  const { granted } = await requestNotificationPermission();
  
  if (granted) {
    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications();
    return subscription;
  }
  
  return null;
}

/**
 * Push notification notification click handler
 * This is handled in the service worker, but can be customized here
 */
export function handleNotificationClick(event) {
  console.log('[Push] Notification clicked:', event);
  
  // Navigate to appropriate page based on notification data
  if (event.notification.data && event.notification.data.url) {
    window.location.href = event.notification.data.url;
  }
  
  event.notification.close();
}