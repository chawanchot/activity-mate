import { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";

export default function useFCM() {
    useEffect(() => {
        const initFCM = async () => {
            // ขอ permission Android 13+
            if (Platform.OS === "android" && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("FCM: Notification permission denied");
                    return;
                }
            }

            // สร้าง channel สำหรับ notifee
            await notifee.createChannel({
                id: "chat_messages",
                name: "Chat Messages",
                importance: AndroidImportance.HIGH,
            });

            // Handle ข้อความตอน foreground
            const unsubscribe = messaging().onMessage(async (remoteMessage) => {
                console.log("📩 FCM foreground:", remoteMessage);

                const title = remoteMessage.data?.title || remoteMessage.notification?.title || "ข้อความใหม่";
                const body = remoteMessage.data?.body || remoteMessage.notification?.body || "";

                await notifee.displayNotification({
                    title,
                    body,
                    android: {
                        channelId: "chat_messages",
                        pressAction: { id: "default" },
                    },
                });
            });

            return unsubscribe;
        };

        initFCM();
    }, []);
}
