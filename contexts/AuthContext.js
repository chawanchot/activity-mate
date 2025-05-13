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
                    // ฟังข้อมูลผู้ใช้แบบเรียลไทม์
                    const userUnsubscribe = firestore()
                        .collection("users")
                        .doc(data.uid)
                        .onSnapshot(
                            async (doc) => {
                                if (doc.exists) {
                                    const userData = { uid: data.uid, ...doc.data() };
                                    setUser(userData);
                                    setLoggedIn(true);
                                } else {
                                    // สร้างผู้ใช้ใหม่ถ้าไม่มีใน Firestore
                                    const newUser = {
                                        username: data.displayName || "Unknown User",
                                        email: data.email,
                                        profilePicture: data.photoURL || "",
                                        role: "member",
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

                    // ฟังสถานะ suspended แบบเรียลไทม์
                    const suspendedUnsubscribe = firestore()
                        .collection("suspended")
                        .where("userID", "==", data.uid)
                        .orderBy("suspendedEnd", "desc")
                        .limit(1)
                        .onSnapshot(
                            async (snapshot) => {
                                let isSuspended = false;
                                let suspendEndDate = null;
                                let reason = "";

                                if (!snapshot.empty) {
                                    const suspendedData = snapshot.docs[0].data();
                                    suspendEndDate = suspendedData.suspendedEnd.toDate(); // แปลง Timestamp เป็น Date
                                    const currentDate = new Date();

                                    if (currentDate <= suspendEndDate) {
                                        // ถ้ายังอยู่ในช่วงระงับ
                                        isSuspended = true;
                                        reason = suspendedData.reason;
                                    }
                                }

                                // ถ้าถูกระงับ ให้ออกจากระบบทันที
                                if (isSuspended) {
                                    await auth().signOut();
                                    setUser(null);
                                    setLoggedIn(false);
                                    setIsLoading(false);
                                    router.replace("/login");

                                    Alert.alert(
                                        "บัญชีถูกระงับ",
                                        `บัญชีของคุณถูกระงับจนถึง ${suspendEndDate.toLocaleString()} เหตุผล: ${reason}`,
                                        [{ text: "ตกลง" }]
                                    );
                                }
                            },
                            (error) => {
                                console.error("Error fetching suspended data:", error);
                                setIsLoading(false);
                            }
                        );

                    // คืนฟังก์ชัน cleanup สำหรับทั้งสอง listener
                    return () => {
                        userUnsubscribe();
                        suspendedUnsubscribe();
                    };
                } catch (error) {
                    console.error("Error setting up listeners:", error);
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