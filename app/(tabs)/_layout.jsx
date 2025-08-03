import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Tabs, router } from "expo-router";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

export default function TabLayout() {
    const { isSuspended, isLoading, loggedIn } = useAuth();

    useEffect(() => {
        if (!isLoading && isSuspended && loggedIn) {
            router.replace("/accountSuspended");
        }
    }, [isSuspended, isLoading]);

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: true,
                tabBarActiveTintColor: "#000000", // สีตอนเลือก
                tabBarInactiveTintColor: "#A2A2A2",
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontFamily: "Kanit_400Regular",
                },
                tabBarStyle: {
                    backgroundColor: "white",
                    height: 60,
                    paddingTop: 2,
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="seachActivity"
                options={{
                    title: "ค้นหากิจกรรม",
                    headerTitleAlign: "center",
                    headerShown: true,
                    headerTitleStyle: {
                        fontFamily: "Kanit_400Regular",
                    },
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                    tabBarIcon: ({ color }) => {
                        return (
                            <MaterialIcons
                                name="search"
                                color={color}
                                size={30}
                            />
                        );
                    },
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: "หน้าหลัก",
                    headerShown: false,
                    tabBarIcon: ({ color }) => {
                        return (
                            <MaterialIcons
                                name="home-filled"
                                color={color}
                                size={30}
                            />
                        );
                    },
                }}
            />
            <Tabs.Screen
                name="createActivity"
                options={{
                    title: "สร้างกิจกรรม",
                    headerTitleAlign: "center",
                    headerShown: true,
                    headerTitleStyle: {
                        fontFamily: "Kanit_400Regular",
                    },
                    headerTitleStyle: {
                        fontFamily: "Kanit_600SemiBold",
                    },
                    tabBarIcon: ({ color }) => {
                        return (
                            <AntDesign
                                name="pluscircle"
                                color={color}
                                size={24}
                            />
                        );
                    },
                }}
            />
        </Tabs>
    );
}
