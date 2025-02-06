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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";

export default function Category() {
    const db = firestore().collection("category");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [category, setCategory] = useState([]);
    const [addInput, setAddInput] = useState("");
    const [editInput, setEditInput] = useState("");
    const [editId, setEditId] = useState(null);

    // ฟังก์ชันดึงข้อมูลหมวดหมู่จาก Firestore
    const getCategoryData = (querySnapShot) => {
        const Arr = [];
        querySnapShot.forEach((res) => {
            const { name, status } = res.data();
            Arr.push({
                id: res.id,
                name,
                status,
            });
        });

        setCategory(Arr);
    };

    // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
    const addCategory = () => {
        if (addInput !== "") {
            db.add({
                name: addInput,
                status: true,
            });

            setAddInput("");
            setShowAddModal(false);
        }
    };

    // ฟังก์ชันเปิด modal แก้ไขหมวดหมู่
    const openEditModal = (id, name) => {
        setEditInput(name);
        setEditId(id);
        setShowEditModal(true);
    };

    // ฟังก์ชันบันทึกการแก้ไขหมวดหมู่
    const submitEdit = () => {
        db.doc(editId).update({
            name: editInput,
        });

        setShowEditModal(false);
    };

    // ฟังก์ชันเปิดใช้งานหมวดหมู่ที่ถูกปิดใช้งาน
    const enableCategory = (id, name) => {
        Alert.alert("เปิดใช้งานหมวดหมู่กิจกรรม", "ยืนยันเปิดใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    db.doc(id).update({
                        status: true,
                    }),
            },
        ]);
    }

    // ฟังก์ชันยกเลิกใช้งานหมวดหมู่
    const cancelCategory = (id, name) => {
        Alert.alert("", "ยืนยันยกเลิกใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    db.doc(id).update({
                        status: false,
                    }),
            },
        ]);
    };

    // ดึงข้อมูลหมวดหมู่จาก Firestore ทุกครั้งที่มีการเปลี่ยนแปลง
    useEffect(() => {
        db.onSnapshot(getCategoryData);
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
                contentContainerStyle={{ padding: 3}}
                renderItem={({ item }) => (
                    <View style={styles.listContainer}>
                        <View style={styles.listContent}>
                            <View style={{ width: "75%" }}>
                                <Text style={styles.name}>
                                    {item.name}
                                </Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                
                                {/* ปุ่มแก้ไข */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        openEditModal(item.id, item.name)
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
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowAddModal(!showAddModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            เพิ่มหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowAddModal(false)}
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
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowEditModal(!showEditModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            แก้ไขหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowEditModal(false)}
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
        fontSize: 18,
        fontFamily: "Kanit_600SemiBold"
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
    }
})
