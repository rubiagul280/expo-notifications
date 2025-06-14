import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import messaging from '@react-native-firebase/messaging';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configure Android channel
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFF",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }
}

export interface FCMNotificationState {
  fcmToken?: string;
  notification?: Notifications.Notification;
}

export const useFCMNotifications = (): FCMNotificationState => {
  const [fcmToken, setFCMToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  async function requestPermissions() {
    if (!Device.isDevice) {
      alert("Must be using a physical device for Push notifications");
      return false;
    }

    // Request permission for iOS
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
      if (!enabled) {
        alert("Failed to get permission for push notifications");
        return false;
      }
    }

    // For Android the permissions are requested automatically when sending notifications
    // But we still need to request notification permissions from Expo
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification");
      return false;
    }

    return true;
  }

  async function getFCMToken() {
    try {
      // Get the token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return undefined;
    }
  }

  useEffect(() => {
    // Set up notification channel for Android
    setupNotificationChannel();

    // Function to handle FCM setup
    const setupFCM = async () => {
      const hasPermission = await requestPermissions();
      
      if (hasPermission) {
        const token = await getFCMToken();
        setFCMToken(token);
      }
    };

    // Set up Firebase messaging
    setupFCM();

    // Listen for foreground messages (when app is open)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground FCM message received:', remoteMessage);
      
      // Convert Firebase message to Expo notification format to reuse your existing handlers
      const notification = {
        request: {
          content: {
            title: remoteMessage.notification?.title || '',
            body: remoteMessage.notification?.body || '',
            data: remoteMessage.data || {},
          },
          trigger: {
            type: 'push',
          },
        },
      } as unknown as Notifications.Notification;
      
      setNotification(notification);
      
      // Display the notification when app is in foreground
      await Notifications.presentNotificationAsync({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });
    });

    // Listen for notification opened events (when app is in background)
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened (background):', remoteMessage);
      // Handle navigation or other actions here
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          // Handle navigation or other actions here
        }
      });

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      setFCMToken(token);
      console.log('FCM Token refreshed:', token);
      // You should send this token to your backend
    });

    // Set up expo notification listeners for local notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
      }
    );

    // Clean up
    return () => {
      unsubscribeForeground();
      unsubscribeOnNotificationOpened();
      unsubscribeTokenRefresh();
      
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    fcmToken,
    notification,
  };
};