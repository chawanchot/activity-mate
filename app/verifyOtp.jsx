import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert
} from "react-native";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";

export default function Verify() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // ✅ ฟังก์ชันส่ง OTP
    const requestOTP = async () => {
        if (phoneNumber.length < 9) {
            Alert.alert("เบอร์โทรศัพท์ไม่ถูกต้อง", "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
            return;
        }

        let formattedPhone = phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber;

        try {
            const authToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUQwNjVBREU2MzYyNjQwQiIsImlhdCI6MTczNzY2NDEyMCwiZXhwIjoxODk1MzQ0MTIwfQ.XqUu73Hqptn6ulCdFaDYe6JCAxq4fnHXXXIhzA5DBh23nT0VpqSY8cqjqSAX1_fUwcMBkY0B73v1brZpQk1dCQ"; // ใส่ authToken จริง

            const response = await axios.post(
                `https://cpaas.messagecentral.com/verification/v3/send?countryCode=66&customerId=C-D065ADE6362640B&flowType=SMS&mobileNumber=${formattedPhone}`,
                {},
                {
                    headers: { authToken }
                }
            );

            console.log("OTP Response:", response.data);

            if (response.data.responseCode === 200) {
                setVerificationId(response.data.data.verificationId);
                setOtpSent(true);
                setResendTimer(60); // รีเซ็ตเวลาถอยหลัง
                Alert.alert("OTP ถูกส่งแล้ว", "กรุณาตรวจสอบข้อความของคุณ");
            } else {
                Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถส่ง OTP ได้");
            }
        } catch (error) {
            console.error("Error requesting OTP:", error);
            Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
        }
    };

    // ✅ ฟังก์ชันตรวจสอบ OTP
    const verifyOTP = async () => {
        if (code.length !== 4) {
            Alert.alert("OTP ไม่ถูกต้อง", "กรุณากรอก OTP 4 หลักให้ถูกต้อง");
            return;
        }

        let formattedPhone = phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber;

        try {
            const authToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUQwNjVBREU2MzYyNjQwQiIsImlhdCI6MTczNzY2NDEyMCwiZXhwIjoxODk1MzQ0MTIwfQ.XqUu73Hqptn6ulCdFaDYe6JCAxq4fnHXXXIhzA5DBh23nT0VpqSY8cqjqSAX1_fUwcMBkY0B73v1brZpQk1dCQ"; // ใส่ authToken จริง

            const response = await axios.get(
                `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=66&mobileNumber=${formattedPhone}&verificationId=${verificationId}&customerId=C-D065ADE6362640B&code=${code}`,
                {
                    headers: { authToken }
                }
            );

            console.log("OTP Verification:", response.data);

            if (response.data.responseCode === 200 && response.data.data.verificationStatus === "VERIFICATION_COMPLETED") {
                Alert.alert("ยืนยันสำเร็จ", "OTP ถูกต้อง!");
            } else {
                Alert.alert("ยืนยันไม่สำเร็จ", "OTP ไม่ถูกต้องหรือหมดอายุ");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
        }
    };

    // ✅ ใช้ useEffect เพื่อนับถอยหลัง 60 วินาที
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendTimer]);

    return (
        <SafeAreaView className="h-full bg-white px-10">
            {/* 📌 แสดงช่องกรอกเบอร์โทรศัพท์และปุ่ม "รับ OTP" เฉพาะตอนที่ยังไม่ได้ส่ง OTP */}
            {!otpSent && (
                <>
                    <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-6">
                        <AntDesign name="phone" size={24} color="black" />
                        <TextInput
                            className="text-black text-lg ml-2 flex-1"
                            value={phoneNumber}
                            placeholder="เบอร์โทรศัพท์"
                            placeholderTextColor="#373F78"
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* 📌 ปุ่มขอ OTP */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="mt-5 bg-orange-400 h-12 items-center justify-center rounded-lg"
                        onPress={requestOTP}
                    >
                        <Text className="font-bold text-lg text-white">รับ OTP</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* 📌 แสดงช่องกรอก OTP และปุ่ม "ยืนยัน OTP" เฉพาะเมื่อส่ง OTP แล้ว */}
            {otpSent && (
                <>
                    <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-6">
                        <AntDesign name="lock" size={24} color="black" />
                        <TextInput
                            className="text-black text-lg ml-2 flex-1"
                            value={code}
                            placeholder="OTP"
                            placeholderTextColor="#373F78"
                            onChangeText={setCode}
                            keyboardType="number-pad"
                        />
                    </View>

                    {/* 📌 ปุ่มยืนยัน OTP */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="mt-5 bg-orange-400 h-12 items-center justify-center rounded-lg"
                        onPress={verifyOTP}
                    >
                        <Text className="font-bold text-lg text-white">ยืนยัน OTP</Text>
                    </TouchableOpacity>

                    {/* 📌 ปุ่มส่ง OTP อีกครั้ง พร้อมแสดงเวลานับถอยหลัง */}
                    <View className="mt-4">
                        {resendTimer > 0 ? (
                            <Text className="text-center text-gray-500">
                                กรุณารอ {resendTimer} วินาทีก่อนส่ง OTP อีกครั้ง
                            </Text>
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="mt-3 bg-gray-300 h-10 items-center justify-center rounded-lg"
                                onPress={requestOTP}
                            >
                                <Text className="text-black font-bold">ส่ง OTP อีกครั้ง</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}