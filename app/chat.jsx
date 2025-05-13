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
    TouchableWithoutFeedback,
    Modal,
    Alert,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Chat() {
    const params = useLocalSearchParams();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [messageData, setMessageData] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [reason, setReason] = useState("");
    const flatListRef = useRef(null);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection("groupchats")
            .where("activityID", "==", params.activityID)
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
            });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (newMessage) {
            try {
                await firestore().collection("groupchats").add({
                    activityID: params.activityID,
                    senderID: user.uid,
                    message: newMessage,
                    deleted: false,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
                setNewMessage("");
                console.log("sended");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    const openReportModal = async () => {
        setMenuVisible(false);
        setReason("")
        setShowModal(true);
    };

    const submitReport = async () => {
        if (reason) {
            try {
                await firestore().collection("reports").add({
                    userID: selectedMessage.user,
                    reportByUserID: user.uid,
                    messageID: selectedMessage.id,
                    reason: reason,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    status: false,
                    inspection: "",
                })
                setShowModal(false);
            } catch (error) {
                console.error("Error cannot save reports:", error);
                setShowModal(false);
            }
        } else {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลการรายงาน", [{ text: "ตกลง" }]);
        }
    }

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
                            <TouchableOpacity style={styles.menuItem} onPress={openReportModal}>
                                <View style={{ flexDirection: "row" }}>
                                    <AntDesign name="warning" size={24} color="black" />
                                    <Text style={styles.menuText}>รายงาน</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {/* Modal รายงานข้อความ */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowModal(!showModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            รายงาน
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={styles.modalInputContainer}>
                            <AntDesign name="warning" size={24} color="#A6A6A6" />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="ข้อมูลการรายงาน"
                                placeholderTextColor="#A6A6A6"
                                value={reason}
                                onChangeText={setReason}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.modalBtn}
                                onPress={submitReport}
                            >
                                <Text style={styles.modalBtnText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    }
});
