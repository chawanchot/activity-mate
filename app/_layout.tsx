import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./../contexts/AuthContext";
import {
    useFonts,
    Kanit_400Regular,
    Kanit_600SemiBold,
    Kanit_700Bold,
} from "@expo-google-fonts/kanit";

// 👇 ตัวแยก logic ออกไปใน component ที่อยู่ "ภายใต้" <AuthProvider>
function RootNavigation() {
    const { isSuspended, isLoading, loggedIn } = useAuth();

    useEffect(() => {
        if (!isLoading && isSuspended && loggedIn) {
            router.replace("/accountSuspended");
        }
    }, [isSuspended, isLoading]);

    return (
        <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="accountSuspended" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
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
            <Stack.Screen
                name="searchEventLocation"
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
                name="userTickets"
                options={{
                    headerShown: true,
                    headerTitle: "กล่องข้อความ",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                }}
            />
        </Stack>
    );
}

// 👇 อันนี้คือ RootLayout จริงที่โหลดฟอนต์ + wrap AuthProvider
export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Kanit_400Regular,
        Kanit_600SemiBold,
        Kanit_700Bold,
    });

    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <RootNavigation />
        </AuthProvider>
    );
}
