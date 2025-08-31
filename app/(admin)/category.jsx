import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Modal,
    TextInput,
    Alert,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import ColorPicker, { Panel3 } from 'reanimated-color-picker';

export default function Category() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [category, setCategory] = useState([]);
    const [addInput, setAddInput] = useState("");
    const [addColor, setAddColor] = useState('#ff0c00');
    const [editInput, setEditInput] = useState("");
    const [editId, setEditId] = useState(null);
    const [editColor, setEditColor] = useState("");
    const [oldColor, setOldColor] = useState("");

    // ฟังก์ชันดึงข้อมูลหมวดหมู่จาก Firestore
    const getCategoryData = async () => {
        try {
            const querySnapshot = await firestore()
                .collection("category")
                .get();

            const Arr = [];
            querySnapshot.forEach((res) => {
                const { name, status, color } = res.data();
                Arr.push({
                    id: res.id,
                    name,
                    status,
                    color,
                });
            });

            // เรียงตามตัวอักษร
            Arr.sort((a, b) => a.name.localeCompare(b.name));

            setCategory(Arr);
        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    };

    // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
    const addCategory = async () => {
        if (addInput !== "") {
            try {
                // ตรวจสอบว่ามีชื่อ category นี้อยู่แล้วหรือไม่
                const querySnapshot = await firestore()
                    .collection("category")
                    .where("name", "==", addInput)
                    .get();

                if (!querySnapshot.empty) {
                    // ถ้ามีชื่อซ้ำ ให้แสดงแจ้งเตือน
                    Alert.alert("แจ้งเตือน", "หมวดหมู่นี้มีอยู่แล้ว", [
                        {
                            text: "ตกลง",
                        },
                    ]);
                } else {
                    await firestore().collection("category").add({
                        name: addInput,
                        status: true,
                        color: addColor,
                    });

                    setAddInput("");
                    setShowAddModal(false);
                    setAddColor("#ff0c00")
                    getCategoryData(); // รีเฟรชข้อมูลหลังเพิ่ม
                }
            } catch (error) {
                console.error("Error adding category:", error);
            }
        } else {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูล", [
                {
                    text: "ตกลง",
                },
            ]);
        }
    };

    // ฟังก์ชันเปิด modal แก้ไขหมวดหมู่
    const openEditModal = (id, name, color) => {
        setEditInput(name);
        setEditId(id);
        setEditColor(color);
        setOldColor(color);
        setShowEditModal(true);
    };

    // ฟังก์ชันบันทึกการแก้ไขหมวดหมู่
    const submitEdit = async () => {
        if (editInput !== "") {
            try {
                const querySnapshot = await firestore()
                    .collection("category")
                    .where("name", "==", editInput)
                    .get();

                if (!querySnapshot.empty) {
                    if (oldColor == editColor) {
                        Alert.alert("แจ้งเตือน", "หมวดหมู่นี้มีอยู่แล้ว", [
                            {
                                text: "ตกลง",
                            },
                        ]);
                    } else {
                        await firestore().collection("category").doc(editId).update({
                            name: editInput,
                            color: editColor,
                        });

                        setShowEditModal(false);
                        setEditColor("");
                        setOldColor("");
                        getCategoryData(); // รีเฟรชข้อมูลหลังแก้ไข
                    }
                } else {
                    await firestore().collection("category").doc(editId).update({
                        name: editInput,
                        color: editColor,
                    });

                    setShowEditModal(false);
                    setEditColor("");
                    setOldColor("");
                    getCategoryData(); // รีเฟรชข้อมูลหลังแก้ไข
                }
            } catch (error) {
                console.error("Error updating category:", error);
            }
        } else {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูล", [
                {
                    text: "ตกลง",
                },
            ]);
        }
    };

    // ฟังก์ชันเปิดใช้งานหมวดหมู่ที่ถูกปิดใช้งาน
    const enableCategory = async (id, name) => {
        Alert.alert("แจ้งเตือน", "ยืนยันเปิดใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    try {
                        await firestore().collection("category").doc(id).update({
                            status: true,
                        });
                        await getCategoryData(); // รีเฟรชข้อมูลหลังเปลี่ยนสถานะ
                    } catch (error) {
                        console.error("Error enabling category:", error);
                    }
                },
            },
        ]);
    };

    // ฟังก์ชันยกเลิกใช้งานหมวดหมู่
    const cancelCategory = async (id, name) => {
        Alert.alert("แจ้งเตือน", "ยืนยันยกเลิกใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    try {
                        await firestore().collection("category").doc(id).update({
                            status: false,
                        });
                        await getCategoryData(); // รีเฟรชข้อมูลหลังเปลี่ยนสถานะ
                    } catch (error) {
                        console.error("Error disabling category:", error);
                    }
                },
            },
        ]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        getCategoryData();
        setRefreshing(false);
    };

    // ดึงข้อมูลหมวดหมู่จาก Firestore เมื่อ component mount
    useEffect(() => {
        getCategoryData();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* ปุ่มเพิ่มหมวดหมู่กิจกรรม */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
            >
                <Text style={styles.addButtonText}>
                    เพิ่มหมวดหมู่กิจกรรม
                </Text>
            </TouchableOpacity>

            {/* แสดงรายการหมวดหมู่ทั้งหมด */}
            <FlatList
                data={category}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 3 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <View style={styles.listContainer}>
                        <View style={styles.listContent}>
                            <View style={{ flexShrink: 1 }}>
                                <Text style={[styles.name, { backgroundColor: item.color }]}>
                                    {item.name}
                                </Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                {/* ปุ่มแก้ไข */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        openEditModal(item.id, item.name, item.color)
                                    }
                                    style={[styles.manageBtn, { backgroundColor: "#FFC300" }]}
                                >
                                    <Text style={[styles.manageBtnText, { color: "black" }]}>แก้ไข</Text>
                                </TouchableOpacity>

                                {/* ปุ่มเปิด/ปิดใช้งาน */}
                                {item.status ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            cancelCategory(item.id, item.name)
                                        }
                                        style={[styles.manageBtn, { backgroundColor: "#FF6200" }]}
                                    >
                                        <Text style={styles.manageBtnText}>
                                            ยกเลิก
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            enableCategory(item.id, item.name)
                                        }
                                        style={[styles.manageBtn, { backgroundColor: "#0095FF" }]}
                                    >
                                        <Text style={styles.manageBtnText}>
                                            เปิดใช้งาน
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Modal เพิ่มหมวดหมู่กิจกรรม */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            เพิ่มหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setShowAddModal(false);
                                setAddColor("#ff0c00");
                                setAddInput("");
                            }}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="category" size={24} color="#373F78" />
                            <TextInput
                                style={styles.input}
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={addInput}
                                onChangeText={setAddInput}
                            />
                        </View>
                        <Text style={styles.ModalLabel}>เลือกสี</Text>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <ColorPicker style={{ width: '50%' }} value='red' onComplete={(color) => setAddColor(color.hex)}>
                                <Panel3 />
                            </ColorPicker>
                        </View>
                        <Text style={styles.ModalLabel}>ตัวอย่าง</Text>
                        <View>
                            <Text style={[styles.activityCategory, { backgroundColor: addColor }]}>
                                {addInput || "หมวดหมู่"}
                            </Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={addCategory}
                                style={styles.modalBtn}
                            >
                                <Text style={styles.modalBtnText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal แก้ไขหมวดหมู่กิจกรรม */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showEditModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            แก้ไขหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setShowEditModal(false);
                                setEditColor("");
                                setOldColor("");
                            }}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="category" size={24} color="#373F78" />
                            <TextInput
                                style={styles.input}
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={editInput}
                                onChangeText={setEditInput}
                            />
                        </View>
                        <Text style={styles.ModalLabel}>เลือกสี</Text>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <ColorPicker style={{ width: '50%' }} value={editColor} onComplete={(color) => setEditColor(color.hex)}>
                                <Panel3 />
                            </ColorPicker>
                        </View>
                        <Text style={styles.ModalLabel}>ตัวอย่าง</Text>
                        <View>
                            <Text style={[styles.activityCategory, { backgroundColor: editColor }]}>
                                {editInput || "หมวดหมู่"}
                            </Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={submitEdit}
                                style={styles.modalBtn}
                            >
                                <Text style={styles.modalBtnText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 6,
    },
    addButton: {
        marginVertical: 6,
        backgroundColor: "#5C77FE",
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold"
    },
    listContainer: {
        backgroundColor: "white",
        padding: 6,
        borderRadius: 10,
        elevation: 5,
        marginBottom: 6
    },
    listContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    name: {
        fontSize: 15,
        fontFamily: "Kanit_600SemiBold",
        color: "white",
        backgroundColor: "#ef4444",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontFamily: "Kanit_600SemiBold",
        alignSelf: "flex-start",
    },
    buttonContainer: {
        width: "25%",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
        gap: 3
    },
    manageBtn: {
        width: "100%",
        height: 30,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    manageBtnText: {
        color: "white",
        fontFamily: "Kanit_400Regular"
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        backgroundColor: "white",
        elevation: 5,
        padding: 14,
        width: "80%",
        minHeight: 85,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    modalHeader: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16
    },
    ModalLabel: {
        marginTop: 10,
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
        textAlign: "center",
        width: "100%"
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginTop: 10,
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
    modalFooter: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 14
    },
    modalBtn: {
        marginBottom: 2,
        backgroundColor: "#5476FF",
        width: 62,
        height: 35,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    modalBtnText: {
        color: "white",
        fontFamily: "Kanit_600SemiBold"
    },
    activityCategory: {
        marginTop: 5,
        fontSize: 14,
        color: "white",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        fontFamily: "Kanit_600SemiBold",
        backgroundColor: "#ff0c00",
    },
});