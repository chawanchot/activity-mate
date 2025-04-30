import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function AdminLayout() {
    const { loggedIn } = useAuth();

    const logout = () => {
        Alert.alert("ออกจากระบบ", "ยืนยันการออกจากระบบ", [
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
                    headerShown: true,
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={logout}>
                            <MaterialIcons
                                name="logout"
                                size={30}
                                color="red"
                            />
                        </TouchableOpacity>
                    ),
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
                    headerTitle: "แชทกิจกรรม",
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
        </Stack>
    );
}
