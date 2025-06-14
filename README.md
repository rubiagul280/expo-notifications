# 📲 Expo Push Notifications with Firebase & EAS Dashboard

This project demonstrates how to integrate **Expo Push Notifications** in a **React Native (Expo)** app using **Firebase Cloud Messaging (FCM)** and **EAS Dashboard** for remote notifications.

## 🛠 Project Setup Overview

### 1. Create React Native App with Expo

This project is built using [Expo](https://expo.dev/), which simplifies the development of React Native apps. Push notifications are handled using Expo's notification APIs and the EAS services for remote delivery.

### 2. Firebase Configuration

* Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
* Add an Android and/or iOS app to your project.
* Download the `google-services.json` for Android and/or `GoogleService-Info.plist` for iOS.
* Enable **Firebase Cloud Messaging (FCM)** in the Firebase console.

### 3. Enable Push Notifications

Follow Expo’s official documentation to enable push notifications:

🔗 [Expo Push Notification Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)

This guide includes:

* Setting up `expo-notifications`
* Registering for push tokens
* Configuring native code for FCM on Android and APNs on iOS

### 4. EAS Dashboard Integration

* Connect your Expo project to [EAS](https://expo.dev/eas).
* Set up your `eas.json` and build using `eas build`.
* Ensure credentials and push notification keys are properly managed in the EAS Dashboard for remote notifications.

> 📘 Expo handles the APNs & FCM integration internally when configured correctly. EAS Dashboard builds are necessary for push notification support in production.

## 🔔 Sending Push Notifications via FCM (Postman)

To send push notifications using Firebase Cloud Messaging (FCM) v1 API (recommended, as legacy APIs are being deprecated):

### 🔐 FCM Access Token

You must use a **Firebase Admin SDK service account** to authorize your requests:

* Generate a private key from the Firebase console.
* Use it to obtain an OAuth2 access token with scope:
  `https://www.googleapis.com/auth/firebase.messaging`

### ✅ POST Request to FCM v1 API

**Endpoint:**

```
POST https://fcm.googleapis.com/v1/projects/shoferiim-80e29/messages:send
```

**Headers:**

```
Authorization: Bearer [YOUR_FCM_ACCESS_TOKEN]
Content-Type: application/json
```

**Body:**

```json
{
  "message": {
    "token": "[DEVICE_TOKEN]",
    "notification": {
      "title": "Shoferi Im",
      "body": "This is a test notification"
    }
  }
}
```

> 🧪 You can use [Postman](https://www.postman.com/) to send this request. Just ensure your token and project ID are correct.

---

## 📦 Dependencies

* `expo-notifications`
* `firebase-admin` (for server or local scripts)
* `expo-modules-autolinking`
* `eas-cli` (for builds and EAS dashboard)

---

## 📚 References

* [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
* [Sending Notifications with FCM v1](https://docs.expo.dev/push-notifications/sending-notifications-custom/)
* [FCM HTTP v1 API Reference](https://firebase.google.com/docs/cloud-messaging/send-message)

---

## 🚀 Notes

* Make sure your app is running on a **physical device** for push notification testing.
* Ensure proper permissions for notifications are requested on both iOS and Android.
* Push tokens expire and change — always fetch the latest token when initializing the app.
