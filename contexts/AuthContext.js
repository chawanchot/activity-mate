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
        const subscriber = auth().onAuthStateChanged(async (data) => {
            setIsLoading(true); // เริ่มต้นโหลดข้อมูล
            if (data) {
                try {
                    // ดึงข้อมูลผู้ใช้จาก Firestore
                    const userDoc = await db.collection("users").doc(data.uid).get();

                    if (userDoc.exists) {
                        setUser({uid: data.uid, ...userDoc.data()}); // อัปเดต State `user` ด้วยข้อมูลจาก Firestore
                    } else {
                        // ถ้าไม่มีข้อมูลใน Firestore ให้สร้างใหม่
                        const newUser = {
                            username: data.displayName || "Unknown User",
                            email: data.email,
                            profilePicture: data.photoURL || "",
                            role: "member",
                            status: true,
                            idCardNumber: "",
                        };
                        // เพิ่มข้อมูลในฐานข้อมูล
                        await db.collection("users").doc(data.uid).set(newUser);
                        // อัปเดต State ด้วยข้อมูลที่สร้าง
                        setUser({uid: data.uid, ...newUser}); 
                    }

                    setLoggedIn(true);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setLoggedIn(false);
                setUser(null); // เคลียร์ข้อมูลผู้ใช้เมื่อออกจากระบบ
            }
            setIsLoading(false); // เสร็จสิ้นการโหลด
        });

        return subscriber; // ยกเลิกการติดตามเมื่อ component ถูกทำลาย
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, loggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook สำหรับใช้งาน Context
export const useAuth = () => {
    return useContext(AuthContext);
};
