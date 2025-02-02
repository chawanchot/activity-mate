import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

const EditProfile = () => {
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState(user.username);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture);
    const [uploading, setUploading] = useState(false);

    // ขอสิทธิ์การเข้าถึงรูปภาพ
    useEffect(() => {
        const requestPermission = async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== "granted") {
                Alert.alert(
                    "ขออภัย", 
                    "ต้องการสิทธิ์การเข้าถึงรูปภาพเพื่ออัปโหลดรูปโปรไฟล์ ไปที่การตั้งค่าเพื่อเปิดสิทธิ์การเข้าถึงรูปภาพ",
                    [
                        { text: "ยกเลิก", onPress: () => router.replace("(tabs)/home") },
                        { text: "ไปที่ตั้งค่า", onPress: () => Linking.openSettings() }
                    ]
                );
            }
        };
    
        requestPermission();
    }, []);    

    // เลือกรูปภาพจากอุปกรณ์
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true, // แก้ไขภาพ
            aspect: [1, 1], // อัตราส่วนภาพ
            quality: 0.5, // ความคมชัด
          });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    // อัปโหลดรูปภาพไปยัง Firebase Cloud Storage
    const uploadImage = async (uri) => {
        const filename = uri.substring(uri.lastIndexOf("/") + 1);
        const reference = storage().ref(`profilePictures/${filename}`);

        setUploading(true);
        await reference.putFile(uri);
        const url = await reference.getDownloadURL();
        setUploading(false);

        return url;
    };

    // บันทึกการเปลี่ยนแปลง
    const saveProfile = async () => {
        // เช็คข้อมูลไม่ใช่ค่าว่าง
        if (username && profilePicture) {
            try {
                let imageUrl = profilePicture;
    
                // ถ้ารูปถูกเปลี่ยนเป็นไฟล์จากในเครื่อง ให้อัปโหลดรูปภาพใหม่
                if (profilePicture.startsWith("file://")) {
                    imageUrl = await uploadImage(profilePicture);
    
                    // เช็คว่ารูปเดิมอยู่ใน Cloud Storage
                    if (user.profilePicture.startsWith("https://firebase")) {
    
                        // ลบรูปเดิมใน Cloud Storage
                        try {
                            // ดึงชื่อไฟล์จาก URL
                            const filename = user.profilePicture.split("/").pop().split("?")[0].replace("profilePictures%2F", "");
                            const reference = storage().ref(`profilePictures/${filename}`);

                            // ลบไฟล์
                            await reference.delete();
                        } catch (error) {
                            console.error("Error delete image:", error);
                        }
                    }
                }
    
                // อัปเดตข้อมูลใน Firestore
                await firestore().collection("users").doc(user.uid).update({
                    username: username,
                    profilePicture: imageUrl,
                });
    
                setUser((prevData) => ({
                    ...prevData, // คัดลอกข้อมูลเดิม
                    username: username,
                    profilePicture: imageUrl,
                }));
        
    
                router.replace("(tabs)/home");
            } catch (error) {
                console.error("Error updating profile:", error);
                Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
            }
        } else {
            Alert.alert(
                "ผิดพลาด", 
                "กรอกข้อมูลให้ครบถ้วน",
                [
                    { text: "ตกลง" }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* รูปโปรไฟล์ */}
            <TouchableOpacity onPress={pickImage}>
                <Image
                    source={{ uri: profilePicture }}
                    style={styles.profileImg}
                />
                <Text style={styles.imageText}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
            </TouchableOpacity>

            {/* ชื่อผู้ใช้ */}
            <Text style={styles.label}>ชื่อผู้ใช้</Text>
            <View style={styles.inputContainer}>
                <FontAwesome name="user" size={24} color="#A6A6A6" />
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            {/* ปุ่มบันทึก */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={uploading} // ทำให้ตอน upload อยู่ไม่สามารถกดได้
            >
                <Text style={styles.saveButtonText}>
                    {uploading ? "กำลังอัปโหลด..." : "บันทึก"}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = {
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "white",
    },
    label: {
        fontFamily: "Kanit_400Regular"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 10,
        borderRadius: 10,
        height: 55,
        paddingHorizontal: 10,
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 18,
        fontFamily: "Kanit_400Regular",
    },
    profileImg: {
        width: 120,
        height: 120,
        objectFit: "contain",
        borderRadius: 15,
        margin: "auto",
    },
    imageText: {
        textAlign: "center",
        color: "#666",
        marginTop: 5,
        marginBottom: 16,
        fontFamily: "Kanit_400Regular"
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#3B82F6",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Kanit_700Bold"
    },
};

export default EditProfile;
