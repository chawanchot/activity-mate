import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: true,
                tabBarActiveTintColor: "#000000", // สีตอนเลือก
                tabBarInactiveTintColor: "#A2A2A2",
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontFamily: "Kanit_400Regular",
                }, // ขนาดตัวอักษร
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
                    headerShown: false,
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
                        fontFamily: "Kanit_400Regular", // ฟอนต์ที่ใช้ใน header
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
