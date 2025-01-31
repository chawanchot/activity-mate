import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import DropDownPicker from "react-native-dropdown-picker";
import proviceData from "../constants/proviceData.json";
import { MaterialIcons } from "@expo/vector-icons";

export default function Verify() {
    const [open, setOpen] = useState(false);
    const [idCardNumber, setIdCardNumber] = useState("");
    const [provice, setProvice] = useState("");

    const checkIdNumberValid = () => {
        // ตรวจสอบว่าเลขบัตรมีความยาว 13 หลักและเป็นตัวเลขทั้งหมด
        if (/^\d{13}$/.test(idCardNumber)) {
            // แปลงเลขบัตรเป็น Array ของตัวเลข
            const digits = idCardNumber.split("").map(Number);

            // คำนวณผลรวมของ 12 หลักแรก โดยใช้ Weight 13-2
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += digits[i] * (13 - i);
            }

            // คำนวณ Check Digit
            const checkDigit = (11 - (sum % 11)) % 10;

            // ตรวจสอบว่า Check Digit ตรงกับหลักที่ 13
            if (checkDigit === digits[12]) {
                const code = digits[1] + "" + digits[2];
                if (code === provice) {
                    Alert.alert("", "ถูกต้อง");
                } else {
                    Alert.alert("", "ข้อมูลบัตรประชาชนไม่ถูกต้อง");
                }
            } else {
                Alert.alert("", "ข้อมูลบัตรประชาชนไม่ถูกต้อง");
            }
        } else {
            Alert.alert("", "ข้อมูลบัตรประชาชนไม่ถูกต้อง");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-7">
            {/* เลขบัตรประชาชน */}
            <Text className="font-kanit">เลขบัตรประชาชน</Text>
            <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                <AntDesign name="idcard" size={24} color="#A6A6A6" />
                <TextInput
                    className="flex-1 ml-2 text-xl font-kanit"
                    value={idCardNumber}
                    onChangeText={setIdCardNumber}
                    keyboardType="number-pad"
                />
            </View>

            {/* จังหวัดที่ออกบัตร */}
            <Text className="font-kanit">จังหวัดที่ออกบัตร</Text>
            <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                <MaterialIcons name="location-city" size={24} color="#A6A6A6" />
                <DropDownPicker
                    open={open}
                    value={provice}
                    items={proviceData.map((item) => ({
                        label: item.name,
                        value: item.id,
                    }))}
                    setOpen={setOpen}
                    setValue={setProvice}
                    placeholder=""
                    style={{
                        backgroundColor: "#FFF5F5",
                        borderWidth: 0,
                        flex: 1,
                        width: "96%",
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: "#FFF5F5",
                    }}
                    labelStyle={{
                        fontFamily: "Kanit_400Regular",
                        fontSize: 18,
                        color: "black",
                    }}
                />
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={checkIdNumberValid}
                className="mt-5 bg-orange-400 h-12 items-center justify-center rounded-lg"
            >
                <Text className="font-bold text-lg text-white">ยืนยัน</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
