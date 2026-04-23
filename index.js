import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("🌙 Background FCM:", remoteMessage);
    console.log("🌙 Background handler fired!");
    console.log(
        "🌙 Background data:",
        JSON.stringify(remoteMessage.data, null, 2)
    );

    // ถ้ามี notification → Firebase SDK จะแสดงให้เองแล้ว → ข้ามไป
    if (remoteMessage.notification) {
        console.log("⏩ Skip notifee, Firebase already showed notification");
        return;
    }

    // ใช้ data payload กรณีไม่มี notification
    const { title, body } = remoteMessage.data || {};
    if (!title && !body) return;

    await notifee.createChannel({
        id: "chat_messages",
        name: "Chat Messages",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: title || "ข้อความใหม่",
        body: body || "",
        android: {
            channelId: "chat_messages",
            pressAction: { id: "default" },
        },
    });
});

import "expo-router/entry";
