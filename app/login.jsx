import {
    StyleSheet,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from "react-native";
import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import {
    GoogleSignin,
    statusCodes,
    isErrorWithCode,
} from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

export default function Login() {

    const { loggedIn } = useAuth();

    useEffect(() => {
        if (loggedIn) {
            router.replace("/"); // ถ้าล็อกอินอยู่แล้ว ให้เปลี่ยนไปหน้าแรก
        }
    }, [loggedIn])

    // ตั้งค่าการใช้งาน Google Sign-In
    GoogleSignin.configure({
        webClientId:
            "16933892808-v9mu7f8p127s94tnbnrfio4ev1mi34bt.apps.googleusercontent.com",
    });

    // ฟังก์ชันเข้าสู่ระบบด้วย Google
    const signInGoogle = async () => {
        try {
            // ตรวจสอบว่ามี Google Play Services อยู่ในอุปกรณ์
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            // ขอรับข้อมูลบัญชี Google ของผู้ใช้
            const response = await GoogleSignin.signIn();

            // สร้าง Credential ของ Google เพื่อใช้ใน Firebase
            const googleCredential = auth.GoogleAuthProvider.credential(
                response?.data.idToken
            );

            // เข้าสู่ระบบ Firebase ด้วย Credential ของ Google
            return auth().signInWithCredential(googleCredential);
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // กำลังดำเนินการเข้าสู่ระบบ
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Google Play Services ไม่มี
                        break;
                    default:
                        console.log(error);
                }
            }
        }
    };

    // ฟังก์ชันเข้าสู่ระบบด้วย Facebook
    const signInFacebook = async () => {

        // ขอสิทธิ์เข้าสู่ระบบผ่าน Facebook
        const result = await LoginManager.logInWithPermissions([
            "public_profile",
            "email",
        ]);

        if (result.isCancelled) {
            console.log("ผู้ใช้ยกเลิกกระบวนการเข้าสู่ระบบ");
        }

         // ขอรับ Access Token ของผู้ใช้ที่เข้าสู่ระบบ Facebook
        const data = await AccessToken.getCurrentAccessToken();

        if (!data) {
            console.log("เกิดข้อผิดพลาดในการขอรับ Access Token");
        }

        // สร้าง Credential ของ Facebook เพื่อใช้ใน Firebase
        const facebookCredential = auth.FacebookAuthProvider.credential(
            data.accessToken
        );

        // เข้าสู่ระบบ Firebase ด้วย Credential ของ Facebook
        return auth().signInWithCredential(facebookCredential);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require("../assets/images/activity_mate_logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* ปุ่มเข้าสู่ระบบ Google */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={signInGoogle}
                style={styles.button}
            >
                <Image
                    source={require("../assets/icons/google.png")}
                    style={{ height: 30 }}
                    resizeMode="contain"
                />
                <Text style={styles.buttonText}>
                    เข้าสู่ระบบด้วย Google
                </Text>
            </TouchableOpacity>

            {/* ปุ่มเข้าสู่ระบบ Facebook */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={signInFacebook}
                style={styles.button}
            >
                <Image
                    source={require("../assets/icons/facebook.png")}
                    style={{ height: 30 }}
                    resizeMode="contain"
                />
                <Text style={styles.buttonText}>
                    เข้าสู่ระบบด้วย Facebook
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white"
    },
    logo: {
        height: 150,
        marginBottom: 75
    },
    button: {
        flexDirection: "row",
        height: 50,
        width: 300,
        backgroundColor: "#f8fafc",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        borderRadius: 5,
        marginBottom: 15,
    },
    buttonText: {
        fontFamily: "Kanit_400Regular",
        fontSize: 18
    }
})