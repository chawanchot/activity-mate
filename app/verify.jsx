import {
    StyleSheet,
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
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

export default function Verify() {
    const { user, setUser } = useAuth();

    const [open, setOpen] = useState(false);
    const [idCardNumber, setIdCardNumber] = useState("");
    const [provice, setProvice] = useState("");

    const checkIdNumberValid = async () => {
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

                // เลขหลักที่ 2-3 ของบัตร
                const code = digits[1] + "" + digits[2];

                // ตรวจสอบว่าตรงกับรหัสของจังหวัด
                if (code === provice) {
                    // update ข้อมูลใน firestore
                    try {
                        // เช็คเลขบัตรซ้ำในฐานข้อมูล
                        const querySnapshot = await firestore()
                            .collection("users")
                            .where("idCardNumber", "==", idCardNumber)
                            .get();
    
                        if (querySnapshot.empty) {
                            // อัปเดตข้อมูลใน Firestore
                            await firestore()
                                .collection("users")
                                .doc(user.uid)
                                .update({
                                    idCardNumber: idCardNumber,
                                    verify: true,
                                });

                            // อัปเดต user ใน AuthContext
                            setUser((prevData) => ({
                                ...prevData,
                                idCardNumber: idCardNumber,
                                verify: true,
                            }));

                            router.replace("/");
                        } else {
                            Alert.alert("ผิดพลาด", "เลขบัตรประชาชนนี้ถูกใช้ไปแล้ว");
                        }
                    } catch (error) {
                        console.error("Error updating document: ", error);
                        Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการยืนยันตัวตน");
                    }
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
        <SafeAreaView style={styles.container}>
            {/* เลขบัตรประชาชน */}
            <Text style={styles.label}>เลขบัตรประชาชน</Text>
            <View style={styles.inputContainer}>
                <AntDesign name="idcard" size={24} color="#A6A6A6" />
                <TextInput
                    style={styles.input}
                    value={idCardNumber}
                    onChangeText={setIdCardNumber}
                    keyboardType="number-pad"
                />
            </View>

            {/* จังหวัดที่ออกบัตร */}
            <Text style={styles.label}>จังหวัดที่ออกบัตร</Text>
            <View style={styles.inputContainer}>
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
                        fontSize: 20,
                        color: "black",
                    }}
                />
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={checkIdNumberValid}
                style={styles.button}
            >
                <Text style={styles.buttonText}>ยืนยัน</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        paddingHorizontal: 18, 
        backgroundColor: "white"
    },
    label: {
        fontFamily: "Kanit_400Regular"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 10,
        borderRadius: 10,
        height: 55,
        paddingHorizontal: 10,
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 20,
        fontFamily: "Kanit_400Regular",
    },
    button: {
        marginTop: 20,
        backgroundColor: "#fb923c",
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    buttonText: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
        color: "white"
    }
})