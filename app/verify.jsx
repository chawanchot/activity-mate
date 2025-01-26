import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Verify() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");

    return (
        <SafeAreaView className="h-full bg-white px-10">
            <Text className="text-center font-bold text-4xl mt-8">
                ยืนยันตัวตน
            </Text>
            <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-6">
                <AntDesign name="phone" size={24} color="black" />
                <TextInput
                    className="text-black text-lg ml-2"
                    value={phoneNumber}
                    placeholder="เบอร์โทรศัพท์"
                    placeholderTextColor="#373F78"
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                className="mt-5 bg-orange-400 h-12 items-center justify-center rounded-lg"
            >
                <Text className="font-bold text-lg text-white">รับ OTP</Text>
            </TouchableOpacity>

            <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-6">
                <AntDesign name="phone" size={24} color="black" />
                <TextInput
                    className="text-black text-lg ml-2"
                    value={code}
                    placeholder="OTP"
                    placeholderTextColor="#373F78"
                    onChangeText={setCode}
                    keyboardType="phone-pad"
                />
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                className="mt-5 bg-orange-400 h-12 items-center justify-center rounded-lg"
            >
                <Text className="font-bold text-lg text-white">ยืนยัน OTP</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
