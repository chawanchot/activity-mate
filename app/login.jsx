import {
    StyleSheet,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Alert,
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
import firestore from "@react-native-firebase/firestore";

export default function Login() {
    const { loggedIn, clearFirestoreCache } = useAuth();

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
        await GoogleSignin.signOut(); // บังคับให้เลือกบัญชีใหม่ทุกครั้ง

        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            const response = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(
                response?.data.idToken
            );

            const userCredential = await auth().signInWithCredential(
                googleCredential
            );
            const uid = userCredential.user.uid;

            const userDocRef = firestore().collection("users").doc(uid);
            const suspendedDocRef = firestore()
                .collection("suspended")
                .where("userID", "==", uid)
                .orderBy("suspendedEnd", "desc") 
                .limit(1);

            // ตรวจสอบข้อมูลใน suspended
            const suspendedDoc = await suspendedDocRef.get();
            const userDoc = await userDocRef.get();

            let isSuspended = false;
            let suspendedEndDate = null;
            let reason = "";

            if (!suspendedDoc.empty) {
                const suspendedData = suspendedDoc.docs[0].data(); // ดึงเอกสารแรก
                if (suspendedData && suspendedData.suspendedEnd) {
                    suspendedEndDate = suspendedData.suspendedEnd.toDate();
                    const currentDate = new Date();
                    if (currentDate > suspendedEndDate) {
                        // await userDocRef.set({ status: true }, { merge: true }); // เพิ่ม merge เพื่อไม่ให้เขียนทับข้อมูลอื่น
                    } else {
                        isSuspended = true;
                        reason = suspendedData.reason;
                    }
                }
            } else {
                isSuspended = false;
            }

            // if (isSuspended || (userDoc.exists && !userDoc.data().status)) {
            if (isSuspended) {
                auth().signOut();

                console.log("TEST SUSPENDED 3")

                Alert.alert(
                    "บัญชีถูกระงับ",
                    suspendedEndDate
                        ? `บัญชีของคุณถูกระงับจนถึง ${suspendedEndDate.toLocaleString()} เหตุผล: ${reason}`
                        : "บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ",
                    [{ text: "ตกลง" }]
                );
                return;
            }
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
        }
    };

    // ฟังก์ชันเข้าสู่ระบบด้วย Facebook
    const signInFacebook = async () => {
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
            const userCredential = await auth().signInWithCredential(
                facebookCredential
            );
            const uid = userCredential.user.uid;

            const userDocRef = firestore().collection("users").doc(uid);
            const suspendedDocRef = firestore()
                .collection("suspended")
                .where("userID", "==", uid)
                .orderBy("suspendedEnd", "desc") 
                .limit(1);

            // ตรวจสอบข้อมูลใน suspended
            const suspendedDoc = await suspendedDocRef.get();
            const userDoc = await userDocRef.get();

            let isSuspended = false;
            let suspendedEndDate = null;
            let reason = "";

            if (!suspendedDoc.empty) {
                const suspendedData = suspendedDoc.docs[0].data(); // ดึงเอกสารแรก
                if (suspendedData && suspendedData.suspendedEnd) {
                    suspendedEndDate = suspendedData.suspendedEnd.toDate();
                    const currentDate = new Date();
                    if (currentDate > suspendedEndDate) {
                        // await userDocRef.set({ status: true }, { merge: true }); // เพิ่ม merge เพื่อไม่ให้เขียนทับข้อมูลอื่น
                    } else {
                        isSuspended = true;
                        reason = suspendedData.reason;
                    }
                }
            } else {
                isSuspended = false;
            }

            // if (isSuspended || (userDoc.exists && !userDoc.data().status)) {
            if (isSuspended) {
                await auth().signOut();

                console.log("TEST SUSPENDED 2")

                Alert.alert(
                    "บัญชีถูกระงับ",
                    suspendedEndDate
                        ? `บัญชีของคุณถูกระงับจนถึง ${suspendedEndDate.toLocaleString()} เหตุผล: ${reason}`
                        : "บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ",
                    [{ text: "ตกลง" }]
                );
                return;
            }
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
        }
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
