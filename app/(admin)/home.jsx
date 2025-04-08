import {
    StyleSheet,
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
        <SafeAreaView style={styles.container}>
            {/* เมนู */}
            <ScrollView style={{ flex: 1, padding: 14 }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/users")}
                >
                    <AntDesign
                        name="user"
                        size={24}
                        color="orange"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการสมาชิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/category")}
                >
                    <MaterialIcons
                        name="category"
                        size={24}
                        color="#00C8FF"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการหมวดหมู่กิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => console.log(`Pressed: จัดการกิจกรรม`)}
                >
                    <MaterialIcons
                        name="event"
                        size={24}
                        color="#006FFF"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>จัดการกิจกรรม</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/report")}
                >
                    <MaterialIcons
                        name="report-gmailerrorred"
                        size={24}
                        color="#FF9D00"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>การแจ้งรายงานจากผู้ใช้</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => console.log(`Pressed: ประวัติการระงับบัญชี`)}
                >
                    <FontAwesome5
                        name="user-lock"
                        size={20}
                        color="#FF0000"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>ประวัติการระงับบัญชี</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    button: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        elevation: 8,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold"
    },
    buttonIcon: {
        marginRight: 14
    }
})
