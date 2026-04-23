import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function ChatTicket() {
    const params = useLocalSearchParams();
    const { user } = useAuth();

    const [newMessage, setNewMessage] = useState("");
    const [messageData, setMessageData] = useState([]);
    const [title, setTitle] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const flatListRef = useRef(null);

    useEffect(() => {
        setTitle(params.title);
        setCreatedAt(params.createdAt);

        const unsubscribe = firestore()
            .collection("chatTickets")
            .where("ticketID", "==", params.ticketID)
            .orderBy("createdAt", "asc")
            .onSnapshot(async (querySnapshot) => {

                console.log("📥 Snapshot triggered:", querySnapshot.size);

                if (querySnapshot.empty) {
                    console.warn("⚠️ ไม่มีข้อมูลใน snapshot");
                }
                
                const messagesWithUsers = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const message = doc.data();

                        const datetime = message.createdAt.toDate();
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
                            .doc(message.userID)
                            .get();

                        const userData = userSnapshot.data();

                        return {
                            id: doc.id,
                            message: message.message,
                            user: message.userID,
                            username: userData.username,
                            role: userData.role,
                            datetime: formattedDateTime,
                        };
                    })
                );

                setMessageData(messagesWithUsers);
            });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (newMessage) {
            try {
                await firestore().collection("chatTickets").add({
                    ticketID: params.ticketID,
                    message: newMessage,
                    userID: user.uid, 
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
                setNewMessage("");
                console.log("sended");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

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

            <View style={styles.subject}>
                <Text style={styles.subjectHeaderTitle}>เรื่อง</Text>
                <Text style={styles.subjectHeader}>{title}</Text>
                <Text style={styles.dateText}>{createdAt}</Text>
            </View>

            {/* Chat Messages */}
            <FlatList
                ref={flatListRef}
                data={messageData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
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
                                {item.role === "admin" ? `[ ADMIN ] ${item.username}` : item.username}
                            </Text>
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                item.user === user.uid ? styles.myBubble : styles.otherBubble
                            ]}
                        >
                            <Text style={styles.messageText}>
                                {item.message}
                            </Text>
                        </View>
                        <Text style={styles.timeText}>{item.datetime}</Text>
                    </View>
                )}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                }
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior="height"
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="ข้อความ..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                >
                    <Text style={styles.sendButtonText}>ส่ง</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
    subject: {
        flexDirection: "column",
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: "white",
    },
    subjectHeader: {
        color: "#000000ff",
        fontFamily: "Kanit_400Regular",
    },
    subjectHeaderTitle: {
        color: "#727171ff",
        fontFamily: "Kanit_400Regular",
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
        backgroundColor: "white",
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        backgroundColor: "white",
        elevation: 5,
        padding: 14,
        width: "80%",
        minHeight: 85,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    modalHeader: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
        marginBottom: 10,
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10
    },
    modalFooter: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 14
    },
    modalBtn: {
        marginBottom: 2,
        backgroundColor: "#5476FF",
        width: 62,
        height: 35,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    modalBtnText: {
        color: "white",
        fontFamily: "Kanit_600SemiBold"
    },
    modalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 5,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "100%",
    },
    modalInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
    deletedMessage: {
        backgroundColor: "#e6e3e3",
    },
    dateText: {
        fontSize: 12,
        fontFamily: "Kanit_400Regular",
        position: "absolute",
        right: 15,
        top: 5,
    },
});
