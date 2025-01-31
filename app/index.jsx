import { useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    const { isLoading, loggedIn, user } = useAuth();

    // useEffect(() => {
    //     if (!isLoading) {
    //         if (!loggedIn) {
    //             router.replace("/login");
    //         } else if (user?.role === "admin") {
    //             router.replace("/(admin)/home");
    //         } else {
    //             router.replace("/(tabs)/home");
    //         }
    //     }
    // }, [isLoading, loggedIn, user]);

    // if (isLoading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //             <ActivityIndicator size="large" color="#0000ff" />
    //             <Text>กำลังโหลดข้อมูล...</Text>
    //         </View>
    //     );
    // }

    return (
        <Redirect href="/verify" />
    )
}
