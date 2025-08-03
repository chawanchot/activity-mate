globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { useEffect } from "react"; 
import { router } from "expo-router"; 
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    // ดึงค่าจาก AuthContext
    const { isLoading, loggedIn, user } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            // รอ layout mount ให้เสร็จก่อน
            if (!loggedIn) {
                router.replace("/login");
            } else if (user?.role === "admin") {
                router.replace("/(admin)/home");
            } else {
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
