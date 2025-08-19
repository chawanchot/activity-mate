import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
    TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const AccountSuspended = () => {
    const { isSuspended, user, loggedIn } = useAuth();

    const [menuVisible, setMenuVisible] = useState(false);
    const [end, setEnd] = useState("");
    const [reason, setReason] = useState("");
    const [suspendedId, setSuspendedId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [descHeight, setDescHeight] = useState(100); // ความสูงเริ่มต้นของ textarea
    const [hasTicket, setHasTicket] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCloseModal = () => {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setDescHeight(100); // ถ้าอยาก reset ความสูง textarea ด้วย
    };

    const formatDateTime = (data) => {
        if (!data) return ""; // ตรวจสอบว่ามีข้อมูลก่อน
        const firebaseTimestamp = new firestore.Timestamp(
            data.seconds,
            data.nanoseconds
        );
        const datetime = firebaseTimestamp.toDate();

        const formattedStartDate = datetime.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return formattedStartDate;
    };

    const logout = () => {
        setMenuVisible(false);
        Alert.alert("แจ้งเตือน", "ยืนยันการออกจากระบบ", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    auth()
                        .signOut()
                        .catch((error) =>
                            console.log("Error signing out: ", error)
                        ),
            },
        ]);
    };

    const getDetail = async () => {
        const detailSnapshot = await firestore()
            .collection("suspended")
            .where("userID", "==", user.uid)
            .orderBy("suspendedEnd", "desc")
            .limit(1)
            .get();

        if (!detailSnapshot.empty) {
            const doc = detailSnapshot.docs[0];
            const detail = doc.data();
            const suspendedEnd = formatDateTime(detail.suspendedEnd);

            const ticketsSnap = await firestore()
                .collection("supportTickets")
                .where("userID", "==", user.uid)
                .where("suspendedId", "==", doc.id)
                .limit(1)
                .get();

            const hasTicket = !ticketsSnap.empty;
            setHasTicket(hasTicket); 

            setReason(detail.reason);
            setSuspendedId(doc.id)
            setEnd(suspendedEnd);
        }
    };

    const handleSubmit = async () => {
        if (!title === "" || !description === "") {
            Alert.alert("แจ้งเตือน", "กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วน", [
                { text: "ตกลง" }
            ]);
            return;
        }
        try {
            // สร้าง support ticket
            const ticketRef = await firestore()
                .collection("supportTickets")
                .add({
                    userID: user.uid,
                    suspendedId: suspendedId,
                    title: title,
                    memberNotify: false,
                    adminNotify: false,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

            const ticketId = ticketRef.id;

            // สร้างเอกสาร chatTicket โดยใช้ ticketId
            await firestore().collection("chatTickets").add({
                ticketID: ticketId,
                message: description,
                userID: user.uid, 
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            setShowModal(false);
            setHasTicket(true)
            setTitle("");
            setDescription("");
            setDescHeight(100);
        } catch (e) {
            console.log(e);
            Alert.alert("แจ้งเตือน", "ไม่สามารถส่งคำร้องได้ โปรดลองใหม่", [
                { text: "ตกลง" }
            ]);
        }
    };

    const handleOpenModal = () => {
        if (!hasTicket) {
            setShowModal(true);
        } else {
            Alert.alert("แจ้งเตือน", "กรุณาตรวจสอบการตอบกลับจากแอดมินที่กล่องข้อความ", [
                { text: "ตกลง" }
            ]);
        }
    }


    useEffect(() => {
        if (!isSuspended) {
            router.replace("/(tabs)/home");
        }
    }, [isSuspended]);

    useEffect(() => {
        if (!loggedIn) {
            router.replace("/login");
        }
    }, [loggedIn]);

    useEffect(() => {
        getDetail();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require("../assets/images/stop.png")} // เปลี่ยนเป็นรูปที่คุณมี
                    style={styles.image}
                    resizeMode="contain"
                />

                <Text style={styles.title}>บัญชีถูกระงับ</Text>
                <Text style={styles.description}>
                    บัญชีของคุณถูกระงับจนถึงวันที่ {end} เหตุผล: {reason}
                </Text>

                <TouchableOpacity style={styles.contactButton} onPress={handleOpenModal}>
                    <Text style={styles.contactText}>ติดต่อแอดมิน</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ ปุ่มเมนู 3 จุด ลอยอยู่ขวาบน ไม่ดันอะไรลง */}
            <TouchableOpacity
                style={styles.floatingMenuButton}
                onPress={() => setMenuVisible(true)}
            >
                <MaterialIcons name="more-vert" size={28} color="black" />
            </TouchableOpacity>

            {/* ✅ Modal Dropdown Menu (เหมือนเดิม) */}
            <Modal
                transparent
                animationType="fade"
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                    activeOpacity={0.8}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity onPress={() => {
                            setMenuVisible(false);
                            router.push("/userTickets");
                        }}>
                            <Text style={[styles.menuItem]}>
                                กล่องข้อความ
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout}>
                            <Text style={[styles.menuItem, { color: "red" }]}>
                                ออกจากระบบ
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal ติดต่อแอดมิน */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>ติดต่อแอดมิน</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleCloseModal}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>

                        {/* เรื่อง */}
                        <View style={styles.modalInputContainer}>
                            <MaterialCommunityIcons
                                name="message-star-outline"
                                size={24}
                                color="#A6A6A6"
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="เรื่อง"
                                placeholderTextColor="#A6A6A6"
                                value={title}
                                onChangeText={setTitle}
                                returnKeyType="done"
                            />
                        </View>

                        {/* รายละเอียด (textarea) */}
                        <View style={styles.modalTextareaContainer}>
                            <MaterialCommunityIcons
                                name="message-text-outline"
                                size={24}
                                color="#A6A6A6"
                                style={{ marginTop: 6 }}
                            />
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    {
                                        textAlignVertical: "top",
                                        height: Math.max(100, descHeight),
                                        paddingTop: 8,
                                    },
                                ]}
                                placeholder="รายละเอียด"
                                placeholderTextColor="#A6A6A6"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                onContentSizeChange={(e) =>
                                    setDescHeight(e.nativeEvent.contentSize.height)
                                }
                                maxLength={200} 
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.modalBtn}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.modalBtnText}>ยืนยัน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    floatingMenuButton: {
        position: 'absolute',
        top: 10,
        right: 16,
        zIndex: 1000,
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 16,
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        width: 150,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontFamily: "Kanit_400Regular",
        fontSize: 14,
        color: '#333',
    },
    content: {
        alignItems: "center",
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        color: "#D32F2F",
        marginBottom: 12,
        fontFamily: "Kanit_600SemiBold",
    },
    description: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "Kanit_400Regular",
    },
    contactButton: {
        marginTop: 15,
    },
    contactText: {
        color: "#1100ffff",
        fontFamily: "Kanit_400Regular",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        elevation: 5,
        padding: 14,
        width: "80%",
        minHeight: 85,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    modalHeader: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
        marginBottom: 10,
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    modalFooter: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 14,
    },
    modalBtn: {
        marginBottom: 2,
        backgroundColor: "#5476FF",
        width: 62,
        height: 35,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    modalBtnText: {
        color: "white",
        fontFamily: "Kanit_600SemiBold",
    },
    // input แบบบรรทัดเดียว
    modalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 8,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "100%",
    },
    // textarea container: สูงขึ้น + จัดข้อความจากด้านบน
    modalTextareaContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFF5F5",
        marginBottom: 8,
        borderRadius: 10,
        minHeight: 100,
        paddingHorizontal: 10,
        paddingTop: 8,
        width: "100%",
    },
    modalInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
});

export default AccountSuspended;
