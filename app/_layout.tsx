import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "./../contexts/AuthContext";
import {
    useFonts,
    Kanit_400Regular,
    Kanit_600SemiBold,
    Kanit_700Bold,
} from "@expo-google-fonts/kanit";

export default function RootLayout() {
    let [fontsLoaded] = useFonts({
        Kanit_400Regular,
        Kanit_600SemiBold,
        Kanit_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShadowVisible: false }}>
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen
                    name="verify"
                    options={{
                        headerShown: true,
                        headerTitle: "สมัครสมาชิก",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontFamily: "Kanit_600SemiBold",
                        },
                    }}
                />
                <Stack.Screen
                    name="searchLocation"
                    options={{
                        headerShown: true,
                        headerTitle: "ค้นหาสถานที่",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontFamily: "Kanit_600SemiBold",
                        },
                    }}
                />
                <Stack.Screen
                    name="activityDetail"
                    options={{
                        headerShown: true,
                        headerTitle: "",
                    }}
                />
                <Stack.Screen
                    name="editActivity"
                    options={{
                        headerShown: true,
                        headerTitle: "แก้ไขกิจกรรม",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontFamily: "Kanit_600SemiBold",
                        },
                    }}
                />
                <Stack.Screen
                    name="editProfile"
                    options={{
                        headerShown: true,
                        headerTitle: "แก้ไขข้อมูลส่วนตัว",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontFamily: "Kanit_600SemiBold",
                        },
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
