import React, { useEffect, useState } from "react";
import {
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

    const openEditModal = (id, name) => {
        setEditInput(name);
        setEditId(id);
        setShowEditModal(true);
    };

    const submitEdit = () => {
        db.doc(editId).update({
            name: editInput,
        });

        setShowEditModal(false);
    };

    const enableCategory = (id, name) => {
        Alert.alert("", "ยืนยันเปิดใช้งานหมวดหมู่" + name, [
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

    useEffect(() => {
        db.onSnapshot(getCategoryData);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white p-2">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAddModal(true)}
                className="my-2 bg-['#5C77FE'] h-[50px] rounded-lg flex justify-center items-center"
            >
                <Text className="text-white text-lg font-bold">
                    เพิ่มหมวดหมู่กิจกรรม
                </Text>
            </TouchableOpacity>

            <FlatList
                data={category}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-white p-2 rounded-lg shadow-black shadow-xl mb-4">
                        <View className="flex-row justify-between items-center">
                            <View className="w-[75%]">
                                <Text className="text-xl font-semibold">
                                    {item.name}
                                </Text>
                            </View>
                            <View className="w-[25%] flex justify-center items-center px-2">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        openEditModal(item.id, item.name)
                                    }
                                    className="mb-1 bg-['#FFC300'] w-full h-[30px] rounded-md flex justify-center items-center"
                                >
                                    <Text className="text-black">แก้ไข</Text>
                                </TouchableOpacity>
                                {item.status ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            cancelCategory(item.id, item.name)
                                        }
                                        className="bg-['#FF6200'] w-full h-[30px] rounded-md flex justify-center items-center"
                                    >
                                        <Text className="text-white">
                                            ยกเลิก
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            enableCategory(item.id, item.name)
                                        }
                                        className="bg-['#0095FF'] w-full h-[30px] rounded-md flex justify-center items-center"
                                    >
                                        <Text className="text-white">
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
                <View className="flex-1 justify-center items-center">
                    <View className="bg-white p-4 shadow-black w-[80%] min-h-[85px] flex justify-center items-center rounded-lg">
                        <Text className="font-bold text-lg">
                            เพิ่มหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowAddModal(false)}
                            className="absolute top-0 right-0"
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-2 w-full">
                            <MaterialIcons
                                name="category"
                                size={24}
                                color="#373F78"
                            />
                            <TextInput
                                className="text-black text-lg ml-2"
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={addInput}
                                onChangeText={setAddInput}
                            />
                        </View>
                        <View className="w-full items-end mt-4">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={addCategory}
                                className="mb-1 bg-['#5476FF'] w-16 h-[35px] rounded-md flex justify-center items-center"
                            >
                                <Text className="text-white font-bold">
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
                <View className="flex-1 justify-center items-center">
                    <View className="bg-white p-4 shadow-black w-[80%] min-h-[85px] flex justify-center items-center rounded-lg">
                        <Text className="font-bold text-lg">
                            แก้ไขหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowEditModal(false)}
                            className="absolute top-0 right-0"
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <View className="flex flex-row items-center bg-[#f1f1f1] rounded-xl h-16 px-3 mt-2 w-full">
                            <MaterialIcons
                                name="category"
                                size={24}
                                color="#373F78"
                            />
                            <TextInput
                                className="text-black text-lg ml-2"
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={editInput}
                                onChangeText={setEditInput}
                            />
                        </View>
                        <View className="w-full items-end mt-4">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={submitEdit}
                                className="mb-1 bg-['#5476FF'] w-16 h-[35px] rounded-md flex justify-center items-center"
                            >
                                <Text className="text-white font-bold">
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
