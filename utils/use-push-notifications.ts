import { useState, useEffect, useRef } from "react";

import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        //shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


export interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken;
    notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
    const [expoPushToken, setExpoPushToken] = useState<
        Notifications.ExpoPushToken | undefined
    >();

    const [notification, setNotification] = useState<
        Notifications.Notification | undefined
    >();

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === "android") {
            void Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FFF",
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
                enableLights: true,
                enableVibrate: true,
                showBadge: true,
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();

                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                alert("Failed to get push token for push notification");

                return;
            }

            token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            });
            console.log('Token: ', token)
        } else {
            alert("Must be using a physical device for Push notifications");
        }

        return token;
    }

    useEffect(() => {
        void (async () => {
            try {
                const token = await registerForPushNotificationsAsync();

                setExpoPushToken(token);
            } catch (error) {
                console.error("Error registering for push notifications:", error);
            }
        })();

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification: any) => {
                setNotification(notification);
                
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response: any) => {
                console.log(response);
            });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }

            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
};