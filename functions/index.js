const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendTicketNotification = onDocumentCreated(
    "chatTickets/{messageId}",
    async (event) => {
        const newMessage = event.data.data();
        if (!newMessage) return;

        const { userID, ticketID, message } = newMessage;
        const db = admin.firestore();

        try {
            // หลด user ที่ส่ง message
            const senderDoc = await db.collection("users").doc(userID).get();
            if (!senderDoc.exists) return;
            const senderData = senderDoc.data();
            const senderRole = senderData.role || "user";
            const senderName = senderData.username || "ผู้ใช้";

            // โหลด ticket
            const ticketDoc = await db
                .collection("supportTickets")
                .doc(ticketID)
                .get();
            if (!ticketDoc.exists) return;
            const ticketData = ticketDoc.data();
            const ticketOwnerId = ticketData.userID;

            const tokens = [];
            let notifTitle = "";
            let notifBody = "";

            if (senderRole === "admin") {
                // ถ้า Admin ตอบ → ส่งหาเจ้าของ ticket
                notifTitle = "มีข้อความจากแอดมิน";
                notifBody = message || "คุณมีข้อความใหม่";

                const ownerDoc = await db
                    .collection("users")
                    .doc(ticketOwnerId)
                    .get();
                if (ownerDoc.exists && ownerDoc.data().fcmToken) {
                    tokens.push(ownerDoc.data().fcmToken);
                }
            } else {
                // ถ้าเจ้าของ ticket ตอบ → ส่งหา Admin ทุกคน
                notifTitle = "มีข้อความติดต่อแอดมินใหม่";
                notifBody = `จากผู้ใช้ ${senderName}`;

                const adminSnap = await db
                    .collection("users")
                    .where("role", "==", "admin")
                    .get();
                for (const admin of adminSnap.docs) {
                    if (admin.id !== userID && admin.data().fcmToken) {
                        tokens.push(admin.data().fcmToken);
                    }
                }
            }

            if (tokens.length === 0) {
                console.log("No tokens found for notification");
                return;
            }

            // payload
            const payload = {
                notification: {
                    title: notifTitle,
                    body: notifBody,
                },
                data: {
                    ticketID,
                    senderID: userID,
                },
            };

            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                ...payload,
                android: { priority: "high" },
            });

            console.log("Notifications sent:", response.successCount);
        } catch (err) {
            console.error("Error sending notification:", err);
        }
    }
);

// 🔔 Trigger: เมื่อมีการสร้าง message ใหม่ใน groupchats
exports.sendChatNotification = onDocumentCreated(
    "groupchats/{messageId}",
    async (event) => {
        const newMessage = event.data.data();
        const senderId = newMessage.senderID;
        const activityId = newMessage.activityID;

        const db = admin.firestore();

        try {
            // 🔍 หา userID ของทุกคนที่ join activity นี้
            const regsSnap = await db
                .collection("registrations")
                .where("activityID", "==", activityId)
                .get();

            if (regsSnap.empty) {
                console.log("No registrations found for activity:", activityId);
            }

            // 📌 ดึงข้อมูลกิจกรรม
            let activityName = "กิจกรรมของคุณ";
            let ownerId = null;

            const activityDoc = await db
                .collection("activities")
                .doc(activityId)
                .get();
            if (activityDoc.exists) {
                const activityData = activityDoc.data();
                activityName = activityData?.name || activityName;
                ownerId = activityData?.createdByUserID || null;
            }

            const tokens = [];

            // 👉 คนที่ join
            for (const reg of regsSnap.docs) {
                const { userID } = reg.data();
                if (!userID) continue;

                const userDoc = await db.collection("users").doc(userID).get();
                if (!userDoc.exists) continue;

                const userData = userDoc.data();

                if (userID !== senderId && userData.fcmToken) {
                    tokens.push(userData.fcmToken);
                }
            }

            // 👉 เจ้าของกิจกรรม
            if (ownerId && ownerId !== senderId) {
                const ownerDoc = await db
                    .collection("users")
                    .doc(ownerId)
                    .get();
                if (ownerDoc.exists) {
                    const ownerData = ownerDoc.data();
                    if (ownerData.fcmToken) {
                        tokens.push(ownerData.fcmToken);
                    }
                }
            }

            if (tokens.length === 0) {
                console.log("No tokens found");
                return;
            }

            // ✅ notification + data (auto เด้งแน่นอน)
            const payload = {
                notification: {
                    title: `มีข้อความใหม่ ${activityName}`,
                    body: newMessage.message,
                },
                data: {
                    activityID: activityId,
                    senderID: senderId,
                },
            };

            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                ...payload,
                android: { priority: "high" }, // ✅ ช่วยปลุกแอปตอน background
            });

            console.log("Notifications sent:", response.successCount);
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }
);

// 🔔 Endpoint: สำหรับทดสอบยิง notification เอง (Postman / curl)
exports.sendTestNotification = onRequest(async (req, res) => {
    const { token, title, body } = req.body;

    if (!token) {
        return res.status(400).send({ error: "FCM token is required" });
    }

    const message = {
        notification: {
            title: title || "ข้อความทดสอบ",
            body: body || "นี่คือข้อความทดสอบจาก Cloud Function",
        },
        data: {
            customData: "12345",
            screen: "chat",
        },
        token,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
        return res.json({ success: true, response });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).send({ error: error.message });
    }
});
