import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { router } from "expo-router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(async (data) => {
            setIsLoading(true);

            if (data) {
                try {
                    // ตรวจสอบข้อมูลใน suspended
                    const suspendedDocRef = firestore().collection("suspended").doc(data.uid);
                    const suspendedDoc = await suspendedDocRef.get();

                    let isSuspended = false;
                    let suspendEndDate = null;

                    if (suspendedDoc.exists) {
                        const suspendedData = suspendedDoc.data();
                        suspendEndDate = new Date(suspendedData.suspendEnd);
                        const currentDate = new Date();

                        if (currentDate > suspendEndDate) {
                            // ถ้าเลยวันที่ระงับแล้ว
                            await firestore()
                                .collection("users")
                                .doc(data.uid)
                                .set({ status: true }, { merge: true }); // อัปเดต status เป็น true
                        } else {
                            // ถ้ายังไม่เลยวันที่ระงับ
                            isSuspended = true;
                        }
                    }

                    // ฟังข้อมูลผู้ใช้แบบเรียลไทม์
                    const unsubscribe = firestore()
                        .collection("users")
                        .doc(data.uid)
                        .onSnapshot(
                            async (doc) => {
                                if (doc.exists) {
                                    const userData = { uid: data.uid, ...doc.data()}
                                    setUser(userData);
                                    setLoggedIn(true);

                                    // ตรวจสอบสถานะและการระงับ
                                    if (isSuspended || !userData.status) {
                                        await auth().signOut();
                                        setUser(null);
                                        setLoggedIn(false);
                                        router.replace("/login");

                                        Alert.alert(
                                            "บัญชีถูกระงับ",
                                            `บัญชีของคุณถูกระงับจนถึง ${suspendEndDate.toLocaleString()}`,
                                            [
                                                { text: "ตกลง" },
                                            ]
                                        );
                                    }
                                } else {
                                    const newUser = {
                                        username: data.displayName || "Unknown User",
                                        email: data.email,
                                        profilePicture: data.photoURL || "",
                                        role: "member",
                                        status: true,
                                    };

                                    await firestore()
                                        .collection("users")
                                        .doc(data.uid)
                                        .set(newUser);

                                    setUser({ uid: data.uid, ...newUser });
                                    setLoggedIn(true);
                                }
                                setIsLoading(false);
                            },
                            (error) => {
                                console.error("Error fetching user data:", error);
                                setIsLoading(false);
                            }
                        );

                    return () => unsubscribe();
                } catch (error) {
                    console.error("Error setting up user listener:", error);
                    setIsLoading(false);
                }
            } else {
                setLoggedIn(false);
                setUser(null);
                setIsLoading(false);
            }
        });

        return subscriber;
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, loggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
