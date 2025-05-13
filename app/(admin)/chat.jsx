import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Alert,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminChat() {
    const params = useLocalSearchParams();
    const { activityID, messageID } = params;
    const { user } = useAuth();

    const [messageData, setMessageData] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const flatListRef = useRef(null);

    const deleteMessage = () => {
        setMenuVisible(false);
        Alert.alert("แจ้งเตือน", "ยืนยันการลบข้อความ", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    try {
                        await firestore()
                                .collection("groupchats")
                                .doc(selectedMessage.id)
                                .update({
                                    deleted: true,
                                });
                        console.log("Message deleted successfully:", selectedMessage.id);
                    } catch (error) {
                        console.error("Error deleting message:", error);
                    }
                }
            },
        ]);
    }

    // จัดการกรณี scrollToIndex ล้มเหลว (เช่น index ไม่อยู่ในช่วงที่มองเห็น)
    const onScrollToIndexFailed = (info) => {
        console.warn("scrollToIndex failed:", info);
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
            flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
            });
        });
    };

    useEffect(() => {
        const unsubscribe = firestore()
            .collection("groupchats")
            .where("activityID", "==", activityID)
            .orderBy("createdAt", "asc")
            .onSnapshot(async (querySnapshot) => {
                const messagesWithUsers = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const messageData = doc.data();

                        const datetime = messageData.createdAt.toDate();
                        const formattedDateTime = datetime.toLocaleString(
                            "th-TH",
                            {
                                timeZone: "Asia/Bangkok",
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        );

                        const userSnapshot = await firestore()
                            .collection("users")
                            .doc(messageData.senderID)
                            .get();

                        const userData = userSnapshot.data();

                        return {
                            id: doc.id,
                            deleted: messageData.deleted,
                            message: messageData.message,
                            createdAt: messageData.createdAt.toDate(),
                            user: messageData.senderID,
                            username: userData.username,
                            datetime: formattedDateTime,
                        };
                    })
                );

                setMessageData(messagesWithUsers);

                // เลื่อนไปยังข้อความที่มี messageID
                if (messageID) {
                    const index = messagesWithUsers.findIndex(
                        (item) => item.id === messageID
                    );
                    if (index !== -1) {
                        setTimeout(() => {
                            flatListRef.current?.scrollToIndex({
                                index,
                                animated: true,
                                viewPosition: 0.5, // จัดให้ข้อความอยู่กลางจอ
                            });
                        }, 500); // รอให้ FlatList โหลดข้อมูลเสร็จ
                    }
                }
            });

        return () => unsubscribe();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.emptyView} />
            </View>

            {/* Chat Messages */}
            <FlatList
                ref={flatListRef}
                data={messageData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={1}
                        onLongPress={(event) => {
                            if (item.user !== user.uid) {
                                if (!item.deleted) {
                                    setSelectedMessage(item);
                                    setMenuPosition({
                                        x: event.nativeEvent.pageX,
                                        y: event.nativeEvent.pageY,
                                    });
                                    setMenuVisible(true);
                                }
                            }
                        }}
                    >
                        <View
                            style={[
                                styles.messageContainer,
                                item.user === user.uid
                                    ? styles.myMessage
                                    : styles.otherMessage,
                            ]}
                        >
                            {item.user !== user.uid && (
                                <Text style={styles.senderName}>
                                    {item.username}
                                </Text>
                            )}
                            <View
                                style={[
                                    styles.messageBubble,
                                    item.user === user.uid ? styles.myBubble : styles.otherBubble,
                                    item.id === messageID && styles.highlightedMessage, // ข้อความที่ถูกรายงาน
                                    item.deleted && styles.deletedMessage, // ข้อความที่ถูกลบ
                                ]}
                            >
                                <Text style={styles.messageText}>
                                    {item.deleted ? "ข้อความถูกลบโดยแอดมิน" : item.message}
                                </Text>
                            </View>
                            <Text style={styles.timeText}>{item.datetime}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.messagesList}
                onScrollToIndexFailed={onScrollToIndexFailed}
            />

            {/* เมนู Dropdown เมื่อกดข้อความค้าง */}
            {menuVisible && (
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuOverlay}>
                        <View
                            style={[
                                styles.menuContainer,
                                { top: menuPosition.y, left: menuPosition.x },
                            ]}
                            onStartShouldSetResponder={() => true} // ป้องกันการส่ง event ไปยัง overlay
                        >
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                style={styles.menuItem} 
                                onPress={deleteMessage}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <MaterialIcons name="delete" size={24} color="white" />
                                    <Text style={styles.menuText}>ลบข้อความ</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "white",
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
        textAlign: "center",
        flex: 1,
    },
    emptyView: {
        width: 34,
    },
    messagesList: {
        padding: 15,
    },
    messageContainer: {
        marginBottom: 15,
    },
    myMessage: {
        alignItems: "flex-end",
    },
    otherMessage: {
        alignItems: "flex-start",
    },
    senderName: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 12,
    },
    myBubble: {
        backgroundColor: "#0084ff",
        borderTopRightRadius: 0,
    },
    otherBubble: {
        backgroundColor: "white",
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
    timeText: {
        fontSize: 10,
        color: "#999",
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
    },
    input: {
        flex: 1,
        borderRadius: 7,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        marginRight: 10,
        backgroundColor: "#FFF5F5",
        fontFamily: "Kanit_400Regular",
    },
    sendButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0084ff",
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    sendButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    menuContainer: {
        position: "absolute",
        backgroundColor: "red",
        borderRadius: 8,
        padding: 8,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: {
        padding: 5,
    },
    menuText: {
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
        marginLeft: 15,
        color: "white"
    },
    highlightedMessage: {
        backgroundColor: "#ffcccc",
    },
    deletedMessage: {
        backgroundColor: "#e6e3e3",
    }
});
