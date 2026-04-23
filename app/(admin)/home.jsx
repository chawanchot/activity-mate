import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
    SafeAreaView,
    ScrollView,
} from "react-native";
import React, { useState } from "react";
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";

export default function AdminHome() {
    const { user, page, setPage } = useAuth();

    const [menuVisible, setMenuVisible] = useState(false);

    const logout = () => {
        Alert.alert("แจ้งเตือน", "ยืนยันการออกจากระบบ", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    try {
                        // ลบ token ใน Firestore
                        await firestore()
                            .collection("users")
                            .doc(user.uid)
                            .update({
                                fcmToken: firestore.FieldValue.delete(),
                            });

                        // ลบ token ในเครื่อง
                        await messaging().deleteToken();
                        console.log("FCM token deleted");

                        // ออกจากระบบ Firebase
                        await auth().signOut();
                        console.log("Signed out successfully");
                    } catch (error) {
                        console.error("Error signing out: ", error);
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileContainer}>
                <FontAwesome5 name="user-circle" size={24} color="#2b2b2bff" />
                <Text style={styles.profileText}>{user?.username}</Text>
            </View>
            {/* เมนู */}
            <ScrollView style={{ flex: 1, padding: 14 }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/users")}
                >
                    <AntDesign
                        name="user"
                        size={24}
                        color="orange"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการสมาชิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/category")}
                >
                    <MaterialIcons
                        name="category"
                        size={24}
                        color="#00C8FF"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการหมวดหมู่กิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/manageActivity")}
                >
                    <MaterialIcons
                        name="event"
                        size={24}
                        color="#006FFF"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการกิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/report")}
                >
                    <MaterialIcons
                        name="report-gmailerrorred"
                        size={24}
                        color="#FF9D00"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                        การแจ้งรายงานจากผู้ใช้
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/suspended")}
                >
                    <FontAwesome5
                        name="user-lock"
                        size={20}
                        color="#FF0000"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>ประวัติการระงับบัญชี</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/tickets")}
                >
                    <FontAwesome5
                        name="comment-dots"
                        size={20}
                        color="#00b62dff"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>การติดต่อจากผู้ใช้</Text>
                </TouchableOpacity>
            </ScrollView>

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
                        <TouchableOpacity
                            onPress={() => {
                                router.replace("/(tabs)/home");
                                setPage("member");
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.menuItem}>
                                สลับไปหน้าผู้ใช้
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    button: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        elevation: 8,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    buttonIcon: {
        marginRight: 14,
    },
    floatingMenuButton: {
        position: "absolute",
        top: 10,
        right: 16,
        zIndex: 1000,
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: 60,
        paddingRight: 16,
    },
    menuContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
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
        color: "#333",
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "80%",
        backgroundColor: "#e39f0b",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginLeft: 12,
        marginTop: 10,
    },
    profileText: {
        color: "white",
        marginLeft: 5,
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
    },
});
