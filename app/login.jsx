import {
    StyleSheet,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import {
    GoogleSignin,
    statusCodes,
    isErrorWithCode,
} from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import firestore from "@react-native-firebase/firestore";

export default function Login() {
    const { loggedIn } = useAuth();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (loggedIn) {
            router.replace("/"); // ถ้าล็อกอินอยู่แล้ว ให้เปลี่ยนไปหน้าแรก
        }
    }, [loggedIn]);

    // ตั้งค่าการใช้งาน Google Sign-In
    GoogleSignin.configure({
        webClientId:
            "16933892808-v9mu7f8p127s94tnbnrfio4ev1mi34bt.apps.googleusercontent.com",
    });

    // ฟังก์ชันเข้าสู่ระบบด้วย Google
    const signInGoogle = async () => {
        setLoading(true);

        await GoogleSignin.signOut(); // บังคับให้เลือกบัญชีใหม่ทุกครั้ง

        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            const response = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(
                response?.data.idToken
            );

            await auth().signInWithCredential(googleCredential);
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        break;
                    default:
                        console.log("Google Sign-In Error:", error);
                }
            } else {
                console.log("Google Sign-In Error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันเข้าสู่ระบบด้วย Facebook
    const signInFacebook = async () => {
        setLoading(true);

        try {
            const result = await LoginManager.logInWithPermissions([
                "public_profile",
                "email",
            ]);
            if (result.isCancelled) {
                console.log("ผู้ใช้ยกเลิกกระบวนการเข้าสู่ระบบ");
                return;
            }

            const data = await AccessToken.getCurrentAccessToken();
            if (!data) {
                console.log("เกิดข้อผิดพลาดในการขอรับ Access Token");
                return;
            }

            const facebookCredential = auth.FacebookAuthProvider.credential(
                data.accessToken
            );
            
            await auth().signInWithCredential(facebookCredential);
        } catch (error) {
            if (error.code === "auth/account-exists-with-different-credential") {
                Alert.alert(
                    "แจ้งเตือน",
                    "อีเมลนี้เคยเข้าสู่ระบบไว้แล้วด้วยวิธีอื่น กรุณาเข้าสู่ระบบด้วยวิธีเดิม เช่น Google",
                    [{ text: "ตกลง" }]
                );
            } else {
                console.log("Facebook Sign-In Error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require("../assets/images/activity_mate_logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
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
                        <Text style={styles.buttonText}>เข้าสู่ระบบด้วย Google</Text>
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
                        <Text style={styles.buttonText}>เข้าสู่ระบบด้วย Facebook</Text>
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    logo: {
        height: 150,
        marginBottom: 75,
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
        fontSize: 18,
    },
});
