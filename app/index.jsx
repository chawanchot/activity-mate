globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { useEffect } from "react"; 
import { router } from "expo-router"; 
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    // ดึงค่าจาก AuthContext
    const { isLoading, loggedIn, user } = useAuth();

    useEffect(() => {
        // ถ้าโหลดข้อมูลเสร็จแล้ว ให้ตรวจสอบเงื่อนไข
        if (!isLoading) {
            if (!loggedIn) {
                // ถ้ายังไม่ได้ล็อกอิน ให้เปลี่ยนไปที่หน้า login
                router.replace("/login");
            } else if (user.role === "admin") {
                // admin ให้เปลี่ยนไปที่หน้า dashboard ของ admin
                router.replace("/(admin)/home");
            } else {
                // user ให้ไปที่หน้า home ของแอป
                router.replace("/(tabs)/home");
            }
        }
    }, [isLoading, loggedIn, user]); 

    // แสดงหน้าโหลด
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" /> 
                <Text style={{ fontFamily: "Kanit_600SemiBold", marginTop: 10 }}>
                    กำลังโหลดข้อมูล...
                </Text>
            </View>
        );
    }
}
