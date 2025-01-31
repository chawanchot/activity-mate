import {
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import React from "react";
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AdminHome() {

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* เมนู */}
            <ScrollView className="flex-1 p-4">
                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => console.log(`Pressed: จัดการสมาชิก`)}
                >
                    <AntDesign
                        name="user"
                        size={24}
                        color="orange"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">จัดการสมาชิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => router.push("/category")}
                >
                    <MaterialIcons
                        name="category"
                        size={24}
                        color="#00C8FF"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">จัดการหมวดหมู่กิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => console.log(`Pressed: จัดการกิจกรรม`)}
                >
                    <MaterialIcons
                        name="event"
                        size={24}
                        color="#006FFF"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">จัดการกิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => console.log(`Pressed: จัดการรีวิวและคะแนน`)}
                >
                    <MaterialIcons
                        name="reviews"
                        size={24}
                        color="#FFF600"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">จัดการรีวิวและคะแนน</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => console.log(`Pressed: จัดการรีวิวและคะแนน`)}
                >
                    <MaterialIcons
                        name="report-gmailerrorred"
                        size={24}
                        color="#FF9D00"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">การแจ้งรายงานจากผู้ใช้</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-6 rounded-lg shadow-md mb-2 flex-row items-center shadow-black"
                    onPress={() => console.log(`Pressed: ประวัติการระงับบัญชี`)}
                >
                    <FontAwesome5
                        name="user-lock"
                        size={20}
                        color="#FF0000"
                        className="mr-4"
                    />
                    <Text className="text-lg font-kanitsemibold">ประวัติการระงับบัญชี</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
