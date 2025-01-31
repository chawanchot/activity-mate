import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

export default function ActivityDetail() {
    const params = useLocalSearchParams();

    const { user } = useAuth();
    const [activity, setActivity] = useState(null);

    const formatDateTime = (data) => {
        if (!data) return ""; // ตรวจสอบว่ามีข้อมูลก่อน
        const firebaseTimestamp = new firestore.Timestamp(data.seconds, data.nanoseconds);
        const datetime = firebaseTimestamp.toDate();

        const formattedStartDate = datetime.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return formattedStartDate;
    }

    const cancelActivity = async () => {
        Alert.alert("", "ยืนยันยกเลิกกิจกรรม", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () => 
                    firestore()
                        .collection("activities")
                        .doc(params.id)
                        .delete()
                        .then(() => {
                            router.replace("/(tabs)/home")
                        })
                        .catch((error) => {
                            console.error("Error delete:", error);
                        })
            },
        ]);
    }

    useEffect(() => {
        const getActivityData = async () => {
            try {
                const fetchActivity = await firestore()
                    .collection("activities")
                    .doc(params.id)
                    .get();

                const activityData = fetchActivity.data();

                const fetchOwner = await firestore()
                    .collection("users")
                    .doc(activityData.createdByUserID)
                    .get();

                const ownerData = fetchOwner.data();

                setActivity({
                    ...activityData,
                    owner: ownerData,
                });
            } catch (error) {
                console.log(error);
            }
        };

        getActivityData();
    }, []);

    if (!activity) {
        // แสดง Loading เมื่อ activity ยังไม่มีข้อมูล
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 justify-between bg-white px-4 py-6">
                <View className="flex-1">
                    <Text className="text-2xl font-kanitbold text-black">
                        {activity.name}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-gray-500 font-kanit">
                            {formatDateTime(activity.startDate)} - {formatDateTime(activity.endDate)}
                        </Text>
                        <View className="flex-row items-center">
                            <AntDesign name="user" color="black" size={14} />
                            <Text className="text-gray-500 ms-1 font-kanit">
                                1/{activity.max}
                            </Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View className="flex-row items-center mt-4">
                        <MaterialIcons name="location-on" size={24} color="black" />
                        <View className="ml-2">
                            <Text className="font-kanitsemibold">
                                {activity.locationName}
                            </Text>
                            <Text className="text-gray-500 font-kanit">
                                {activity.subDistrict} {activity.district} {activity.provice}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="text-gray-700 mt-4 font-kanit text-lg">
                        {activity.description}
                    </Text>

                    {/* Participant */}
                    <View className="flex-row items-center mt-10">
                        <Image
                            source={{ uri: activity.owner.profilePicture }}
                            className="w-12 h-12 rounded-full"
                        />
                        <View className="ml-3">
                            <Text className="text-black font-kanit">{activity.owner.username}</Text>
                            <View className="flex-row items-center">
                                <FontAwesome name="star" size={16} color="#FFD700" />
                                <Text className="text-gray-700 ml-1 font-kanit">4</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View className="mt-8">
                    {/* <TouchableOpacity activeOpacity={0.8} className="flex-row  justify-center bg-[#FE805C] rounded-full py-3">
                        <Text className="ms-2 text-center text-white font-kanitbold">
                            เข้าร่วมกิจกรรม
                        </Text>
                    </TouchableOpacity> */}
                    <View className="pb-4 border-b border-gray-400">
                        <TouchableOpacity activeOpacity={0.8} className="flex-row  justify-center bg-blue-500 rounded-full py-3">
                            <MaterialIcons name="chat-bubble-outline" color="white" size={24} />
                            <Text className="ms-2 text-center text-white font-kanitbold">
                                สนทนา
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {activity.owner.uid === user.uid && (
                        <View>
                            <TouchableOpacity activeOpacity={0.8} className="bg-yellow-500 rounded-lg py-3 mt-4">
                                <Text className="text-center text-white font-kanitbold">
                                    สิ้นสุดกิจกรรม
                                </Text>
                            </TouchableOpacity>
                            <View className="flex-row gap-2 mt-2">
                                <TouchableOpacity 
                                    activeOpacity={0.8} 
                                    onPress={() => router.push({
                                        pathname: "editActivity",
                                        params: {
                                            id: params.id
                                        }
                                    })}
                                    className="flex-1 bg-blue-500 rounded-lg py-3"
                                >
                                    <Text className="text-center text-white font-kanitbold">
                                        แก้ไข
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    activeOpacity={0.8} 
                                    onPress={cancelActivity} 
                                    className="flex-1 bg-red-500 rounded-lg py-3"
                                >
                                    <Text className="text-center text-white font-kanitbold">
                                        ยกเลิกกิจกรรม
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
