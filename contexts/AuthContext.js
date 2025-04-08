import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// สร้าง Context
const AuthContext = createContext();

// สร้าง Provider สำหรับจัดการข้อมูล
export const AuthProvider = ({ children }) => {

    // เก็บข้อมูลผู้ใช้
    const [user, setUser] = useState(null); 
    const [loggedIn, setLoggedIn] = useState(false); // สถานะล็อกอิน
    const [isLoading, setIsLoading] = useState(true); // กำลังโหลดข้อมูล

    // ฟังก์ชันสำหรับตรวจสอบสถานะการเข้าสู่ระบบ
    useEffect(() => {
        // ติดตามสถานะการเข้าสู่ระบบของ Firebase Authentication
        const subscriber = auth().onAuthStateChanged(async (data) => {
            setIsLoading(true); // เริ่มต้นโหลดข้อมูล

            if (data) { // ถ้ามีข้อมูลผู้ใช้
                try {
                    // ดึงข้อมูลผู้ใช้จาก Firestore โดยใช้ UID เป็น document ID
                    const userDoc = await firestore().collection("users").doc(data.uid).get();

                    if (userDoc.exists) { 
                        // ถ้ามีข้อมูลอยู่ใน Firestore ให้อัปเดต state user
                        setUser({ uid: data.uid, ...userDoc.data() }); 
                    } else {
                        // ถ้ายังไม่มีข้อมูลผู้ใช้ใน Firestore ให้สร้างใหม่
                        const newUser = {
                            username: data.displayName || "Unknown User", // ใช้ displayName ถ้ามี
                            email: data.email, // อีเมลของผู้ใช้
                            profilePicture: data.photoURL || "", // รูปโปรไฟล์ (ถ้ามี)
                            role: "member", // กำหนดบทบาทเป็น member
                            status: true, // กำหนดสถานะเป็นเปิดใช้งาน
                        };

                        // บันทึกข้อมูลผู้ใช้ใหม่ลง Firestore
                        await firestore().collection("users").doc(data.uid).set(newUser);

                        // อัปเดต state user ด้วยข้อมูลที่เพิ่งสร้าง
                        setUser({ uid: data.uid, ...newUser }); 
                    }

                    setLoggedIn(true); // กำหนดว่าเข้าสู่ระบบเรียบร้อย
                } catch (error) {
                    console.error("Error fetching user data:", error); // แสดง error ถ้าดึงข้อมูลไม่ได้
                }
            } else { 
                // ถ้าผู้ใช้ออกจากระบบ
                setLoggedIn(false);
                setUser(null); // ล้างข้อมูลผู้ใช้
            }

            setIsLoading(false); // เสร็จสิ้นการโหลด
        });

        return subscriber; // คืนค่าฟังก์ชันเพื่อยกเลิกการติดตามเมื่อ component ถูกทำลาย
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, loggedIn }}>
            {children} 
        </AuthContext.Provider>
    );
};

// Hook สำหรับเรียกใช้ Context
export const useAuth = () => {
    return useContext(AuthContext);
};
