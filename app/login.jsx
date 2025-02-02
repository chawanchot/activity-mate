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
            router.replace("/");
        }
    }, [loggedIn])

    GoogleSignin.configure({
        webClientId:
            "16933892808-v9mu7f8p127s94tnbnrfio4ev1mi34bt.apps.googleusercontent.com",
    });

    const signInGoogle = async () => {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });
            // Get the users ID token
            const response = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(
                response?.data.idToken
            );

            // Sign-in the user with the credential
            return auth().signInWithCredential(googleCredential);
        } catch (error) {
            console.log("error: ", error);
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        break;
                    default:
                    // some other error happened
                }
            } else {
                // an error that's not related to google sign in occurred
            }
        }
    };

    const signInFacebook = async () => {
        // Attempt login with permissions
        const result = await LoginManager.logInWithPermissions([
            "public_profile",
            "email",
        ]);

        if (result.isCancelled) {
            throw "User cancelled the login process";
        }

        // Once signed in, get the users AccessToken
        const data = await AccessToken.getCurrentAccessToken();

        if (!data) {
            throw "Something went wrong obtaining access token";
        }

        // Create a Firebase credential with the AccessToken
        const facebookCredential = auth.FacebookAuthProvider.credential(
            data.accessToken
        );

        // Sign-in the user with the credential
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