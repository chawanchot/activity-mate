import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuspended, setIsSuspended] = useState(false);

    const [page, setPage] = useState("member");

    // 🔁 เก็บ unsubscribe สำหรับ realtime listeners
    const userUnsubscribeRef = useRef(null);
    const suspendedUnsubscribeRef = useRef(null);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(async (data) => {
            setIsLoading(true);

            // 🔁 Cleanup ทุกครั้งที่ user เปลี่ยนหรือออกจากระบบ
            if (userUnsubscribeRef.current) {
                userUnsubscribeRef.current();
                userUnsubscribeRef.current = null;
            }

            if (suspendedUnsubscribeRef.current) {
                suspendedUnsubscribeRef.current();
                suspendedUnsubscribeRef.current = null;
            }

            if (data) {
                try {
                    // 🔎 ฟังข้อมูลผู้ใช้แบบ realtime
                    userUnsubscribeRef.current = firestore()
                        .collection("users")
                        .doc(data.uid)
                        .onSnapshot(
                            async (doc) => {
                                if (doc.exists) {
                                    const userData = { uid: data.uid, ...doc.data() };
                                    setUser(userData);
                                    setLoggedIn(true);

                                    if (userData.role === "admin") {
                                        setPage("admin");
                                    } else {
                                        setPage("member");
                                    }
                                } else {
                                    // ➕ สร้างผู้ใช้ใหม่ถ้ายังไม่มีใน Firestore
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

                                    if (newUser.role === "admin") {
                                        setPage("admin");
                                    } else {
                                        setPage("member");
                                    }

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

                    // 🔎 ฟังสถานะ suspended แบบ realtime
                    suspendedUnsubscribeRef.current = firestore()
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
                                    suspendEndDate = suspendedData.suspendedEnd.toDate();
                                    const currentDate = new Date();

                                    if (currentDate <= suspendEndDate) {
                                        isSuspended = true;
                                        reason = suspendedData.reason;
                                    }
                                }

                                if (isSuspended) {
                                    setIsSuspended(true);
                                    setIsLoading(false);
                                } else {
                                    setIsSuspended(false);
                                }
                            },
                            (error) => {
                                console.error("Error fetching suspended data:", error);
                                setIsLoading(false);
                            }
                        );
                } catch (error) {
                    console.error("Error setting up listeners:", error);
                    setIsLoading(false);
                }
            } else {
                // 👤 ผู้ใช้ไม่ได้ล็อกอิน
                setLoggedIn(false);
                setUser(null);
                setIsLoading(false);
            }
        });

        // ✅ cleanup รวมเมื่อ component unmount
        return () => {
            subscriber();

            if (userUnsubscribeRef.current) {
                userUnsubscribeRef.current();
                userUnsubscribeRef.current = null;
            }

            if (suspendedUnsubscribeRef.current) {
                suspendedUnsubscribeRef.current();
                suspendedUnsubscribeRef.current = null;
            }
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, loggedIn, isSuspended, page, setPage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
