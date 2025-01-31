import { View, Text, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

export default function MemberHome() {
    const { user, loggedIn } = useAuth();
    const [tab, setTab] = useState(false);

    const [activityList, setActivityList] = useState([]);

    const logout = () => {
        Alert.alert("", "ออกจากระบบ", [
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

    useEffect(() => {
        const getActivity = async () => {
            try {
                const getData = await firestore()
                    .collection("activities")
                    .where("createdByUserID", "==", user.uid)
                    .get();

                const dataActivity = [];

                for (const doc of getData.docs) {
                    const data = doc.data();

                    // ดึง category จาก categoryID
                    const getCategory = await firestore()
                        .collection("category")
                        .doc(data.categoryID)
                        .get();

                    const category = getCategory.data();

                    const firebaseTimestamp = new firestore.Timestamp(
                        data.startDate.seconds,
                        data.startDate.nanoseconds
                    );
                    const datetime = firebaseTimestamp.toDate();

                    const formattedDate = datetime.toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    });

                    dataActivity.push({
                        id: doc.id,
                        name: data.name,
                        category: category.name,
                        description: data.description,
                        max: data.max,
                        locationName: data.locationName,
                        subdistric: data.subdistric,
                        distric: data.distric,
                        provice: data.provice,
                        startDate: formattedDate,
                    });
                }

                setActivityList(dataActivity);
            } catch (error) {
                console.log("fetch Data error: ", error)
            }
        };

        getActivity();
    }, [tab]);

    if (!user) {
        return null; // หยุดการเรนเดอร์เมื่อ user เป็น null
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="h-full bg-white pt-5">
                {/* โปรไฟล์ */}
                <View className="flex-row justify-between p-6">
                    <View>
                        <Text className="font-kanitsemibold text-2xl">
                            {user.username}
                        </Text>
                        <TouchableOpacity onPress={logout}>
                            <MaterialIcons
                                name="logout"
                                size={30}
                                color="red"
                            />
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{ uri: user.profilePicture }}
                        className="w-[120px] h-[120px] object-contain rounded-lg"
                    />
                </View>

                {/* แท็บ */}
                <View className="flex-row border-b border-gray-200">
                    <TouchableOpacity
                        onPress={() => setTab(true)}
                        className={`flex-1 items-center p-2 ${tab ? "border-b-2 border-black" : ""}`}
                    >
                        <Text
                            className={`${tab ? "font-kanitsemibold" : "text-gray-400 font-kanit"}`}
                        >
                            การเข้าร่วม
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab(false)}
                        className={`flex-1 items-center p-2 ${!tab ? "border-b-2 border-black" : ""}`}
                    >
                        <Text className={`${!tab ? "font-kanitsemibold" : "text-gray-400 font-kanit"}`}>
                            กิจกรรมที่จัด
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* เนื้อหา */}
                <FlatList
                    data={activityList}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            activeOpacity={0.8} 
                            onPress={() => router.push({
                                pathname: "activityDetail",
                                params: {
                                    id: item.id
                                }
                            })}
                        >
                            <View className="bg-white rounded-lg shadow-md mb-4 p-2 h-[150px]">
                                {/* Header: จำนวนผู้เข้าร่วม */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <AntDesign name="user" color="black" size={14} />
                                        <Text className="text-gray-500 text-base ms-1 font-kanitsemibold">
                                            1/{item.max}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-base ms-1 font-kanitsemibold">
                                        {item.startDate}
                                    </Text>
                                </View>

                                {/* ชื่อกิจกรรม */}
                                <Text className="text-black font-kanitbold text-xl mb-1">
                                    {item.name}
                                </Text>

                                {/* คำอธิบายกิจกรรม */}
                                <Text
                                    className="text-gray-700 text-base font-kanit"
                                    numberOfLines={2}
                                >
                                    {item.description}
                                </Text>

                                <View className="flex-row items-center justify-between mt-auto">
                                    {/* หมวดหมู่ */}
                                    <Text className="text-sm text-white bg-red-500 px-2 py-1 rounded-xl font-kanitsemibold">
                                        {item.category}
                                    </Text>

                                    {/* สถานที่ */}
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="location-on" color="black" size={18} />
                                        <Text className="text-gray-600 text-base font-kanit">
                                            {item.locationName}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 8}}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}
