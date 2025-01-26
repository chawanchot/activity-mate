// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// สร้าง Context
const AuthContext = createContext();

// สร้าง Provider
export const AuthProvider = ({ children }) => {
    const db = firestore();

    const [user, setUser] = useState(null); // State สำหรับเก็บข้อมูลผู้ใช้
    const [loggedIn, setLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // State สำหรับตรวจสอบการโหลด

    // ฟังก์ชันสำหรับตรวจสอบสถานะการเข้าสู่ระบบ
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((user) => {
            setUser(user);
            setIsLoading(false); // เมื่อโหลดเสร็จสิ้น

            if (user) {
                setLoggedIn(true);

                db.collection("users")
                    .doc(user.uid)
                    .get()
                    .then(function (doc) {
                        if (doc.exists) {
                            console.log("1");
                            console.log(doc.data());
                            setUser(doc.data());
                        } else {
                            console.log("2");
                            db.collection("users").doc(user.uid).set({
                                uid: user.uid,
                                username: user.displayName,
                                email: user.email,
                                profilePicture: user.photoURL,
                                role: "member",
                                status: true,
                            });
                        }
                    })
                    .catch(function (error) {
                        console.log("Error getting document:", error);
                    });
            } else {
                setLoggedIn(false);
            }
        });

        return subscriber; // ยกเลิกการติดตามเมื่อ component ถูกทำลาย
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, loggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook สำหรับใช้งาน Context
export const useAuth = () => {
    return useContext(AuthContext);
};
