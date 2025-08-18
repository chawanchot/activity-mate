import { Stack, router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function AdminLayout() {
    const { loggedIn, isSuspended, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isSuspended && loggedIn) {
            router.replace("/accountSuspended");
        }
    }, [isSuspended, isLoading]);

    useEffect(() => {
        if (!loggedIn) {
            router.replace("/login");
        }
    }, [loggedIn]);

    return (
        <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen
                name="home"
                options={{
                    headerShown: false,
                    headerTitle: "",
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name="category"
                options={{
                    headerTitle: "จัดการหมวดหมู่กิจกรรม",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="report"
                options={{
                    headerTitle: "การแจ้งรายงานจากผู้ใช้",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="users"
                options={{
                    headerTitle: "จัดการสมาชิก",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="chat"
                options={{
                    headerShown: false,
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="chatTicket"
                options={{
                    headerShown: false,
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="manageActivity"
                options={{
                    headerTitle: "จัดการกิจกรรม",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="suspended"
                options={{
                    headerTitle: "ประวัติการระงับบัญชี",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
            <Stack.Screen
                name="tickets"
                options={{
                    headerTitle: "การติดต่อจากผู้ใช้",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
        </Stack>
    );
}
