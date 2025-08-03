import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";

const AccountSuspended = () => {
    const { isSuspended, user, loggedIn } = useAuth();

    const [menuVisible, setMenuVisible] = useState(false);
    const [end, setEnd] = useState("");
    const [reason, setReason] = useState("");

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
            const detail = detailSnapshot.docs[0].data();
            const suspendedEnd = formatDateTime(detail.suspendedEnd);

            setReason(detail.reason);
            setEnd(suspendedEnd);
        }
    };

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

                <TouchableOpacity style={styles.contactButton}>
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
                        <TouchableOpacity onPress={logout}>
                            <Text style={[styles.menuItem, { color: "red" }]}>
                                ออกจากระบบ
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
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
});

export default AccountSuspended;
