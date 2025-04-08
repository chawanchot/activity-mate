import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    Image,
    TextInput,
    Alert,
    Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { MaterialIcons, AntDesign, FontAwesome5 } from "@expo/vector-icons";

export default function Users() {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [usersData, setUsersData] = useState([]);
    const [search, setSearch] = useState("");
    const [suspendedSelected, setSuspendedSelected] = useState(null);
    const [suspendedReason, setSuspendedReason] = useState("");
    const [suspendedDate, setSuspendedDate] = useState("");

    const getUsers = async () => {
        try {
            const getData = await firestore().collection("users").get();
            const users = getData.docs.map(doc => {
                return {
                    ...doc.data(),
                    id: doc.id
                }
            });
            
            const filltered = users.filter(item => item.username.toLowerCase().includes(search.toLocaleLowerCase()))
            setUsersData(filltered);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
    };

    const changeRole = (id, username, role) => {
        Alert.alert(role === "member" ? "ยืนยันให้สิทธิ์ผู้ดูแลระบบ" : "ยกเลิกสิทธิ์ผู้ดูแลระบบ", username, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    await firestore()
                        .collection("users")
                        .doc(id)
                        .update({
                            role: role === "member" ? "admin" : "member"
                        }).then(() => {
                            getUsers();
                        }).catch((error) => {
                            console.log("Update users error: ", error);
                        })
                }
            },
        ]);
    }

    const openSuspendedModal = (id) => {
        setSuspendedSelected(id);
        setShowModal(true);
    }

    const confirmSuspended = async () => {
        if (suspendedReason && suspendedDate) {

            // วันที่ปัจจุบัน
            const currentDate = new Date();
            
            // คำนวณวันที่สิ้นสุดการระงับ
            const endDate = new Date(currentDate);
            endDate.setDate(currentDate.getDate() + parseInt(suspendedDate));

            try {
                // เพิ่มข้อมูล suspended
                await firestore().collection("suspended").add({
                    userID: suspendedSelected,
                    reason: suspendedReason,
                    suspendedStart: firestore.FieldValue.serverTimestamp(),
                    suspendedEnd: firestore.Timestamp.fromDate(endDate),
                })

                // แก้ไข status ใน users
                await firestore().collection("users").doc(suspendedSelected).update({
                    status: false
                })

                setSuspendedSelected(null);
                setSuspendedDate("");
                setSuspendedReason("");
                setShowModal(false);

                getUsers();
            } catch (error) {
                console.error("Error save suspended Data:", error);
            }
        } else {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลการรายงาน", [{ text: "ตกลง" }]);
        }
    }

    const cancelSuspended = async (id) => {
        Alert.alert("ยืนยัน", "ยกเลิกการระงับบัญชี", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: async () => {
                    try {
                        const query = await firestore()
                            .collection('suspended')
                            .where("userID", "==", id)
                            .get();
            
                        // สร้าง Batch
                        const batch = firestore().batch();
            
                        // เพิ่มคำสั่งลบแต่ละเอกสารลงใน Batch
                        query.forEach(doc => {
                            batch.delete(doc.ref);
                        });
            
                        // ดำเนินการ Batch
                        await batch.commit();
                        
                        // แก้ไข status ใน users
                        await firestore().collection("users").doc(id).update({
                            status: true
                        })

                        getUsers();
                    } catch (error) {
                        console.error("Error cancel suspended:", error);
                    }
                }
            },
        ]);
    }

    const onRefresh = () => {
        setRefreshing(true);
        getUsers();
        setRefreshing(false);
    };

    useEffect(() => {
        getUsers();
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <View style={styles.inputContainer}>
                    <MaterialIcons
                        name="search"
                        size={24}
                        color="#A6A6A6"
                    />
                    <TextInput 
                        placeholder="ค้นหา" 
                        style={styles.input} 
                        value={search} 
                        onChangeText={setSearch} 
                    />
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.searchBtn}
                    onPress={getUsers}
                >
                    <Text style={styles.searchBtnText}>
                        ค้นหา
                    </Text>
                </TouchableOpacity>
            </View>

            {/* แสดงรายการสมาชิก */}
            <FlatList
                data={usersData}
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
                            <View style={styles.leftContainer}>
                                <View style={styles.leftContent}>
                                    <Image 
                                        source={{ uri: item.profilePicture }} 
                                        style={styles.profileImage}
                                    />
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.headerText}>ประเภท</Text>
                                        {item.role === "admin" ? (
                                            <Text style={[styles.badge, { backgroundColor: "#FF4400" }]}>ผู้ดูแล</Text>
                                        ) : (
                                            <Text style={styles.badge}>สมาชิกทั่วไป</Text>
                                        )}
                                    </View>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.headerText}>สถานะบัญชี</Text>
                                        {item.status ? (
                                            <Text style={[styles.badge, { backgroundColor: "#008CFF" }]}>ไม่ถูกระงับ</Text>
                                        ) : (
                                            <Text style={[styles.badge, { backgroundColor: "#FF4400" }]}>ถูกระงับ</Text>
                                        )}
                                    </View>
                                </View>
                                <Text style={styles.username}>{item.username}</Text>
                            </View>
                            <View style={styles.rightContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[styles.btn,{ backgroundColor: "#00E5FF" }]}
                                    onPress={() => changeRole(item.id, item.username, item.role)}
                                >
                                    <Text style={styles.btnText}>
                                        {item.role === "admin" ? "ยกเลิกสิทธิ์ผู้ดูแล" : "ให้สิทธิ์ผู้ดูแล"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[styles.btn,{ backgroundColor: "#FFC300" }]}
                                    onPress={() => {
                                        item.status ? openSuspendedModal(item.id) : cancelSuspended(item.id)
                                    }}
                                >
                                    <Text style={styles.btnText}>
                                        {item.status ? "ระงับบัญชี" : "ยกเลิกระงับบัญชี"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Modal ระงับบัญชี */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowModal(!showModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            ระงับบัญชี
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={styles.modalInputContainer}>
                            <AntDesign name="warning" size={24} color="#A6A6A6" />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="เหตุผล"
                                placeholderTextColor="#A6A6A6"
                                value={suspendedReason}
                                onChangeText={setSuspendedReason}
                            />
                        </View>

                        {/* Dropdown จำนวนวัน */}
                        <View style={styles.modalInputContainer}>
                            <MaterialIcons
                                name="date-range"
                                size={24}
                                color="#A6A6A6"
                            />
                            <DropDownPicker
                                open={openDropdown}
                                value={suspendedDate}
                                items={[
                                    {
                                        label: "3 วัน",
                                        value: 3,
                                    },
                                    {
                                        label: "7 วัน",
                                        value: 7,
                                    },
                                    {
                                        label: "15 วัน",
                                        value: 15,
                                    },
                                    {
                                        label: "ถาวร",
                                        value: 999,
                                    },
                                ]}
                                setOpen={setOpenDropdown}
                                setValue={setSuspendedDate}
                                placeholder="จำนวนวัน"
                                style={{
                                    backgroundColor: "#FFF5F5",
                                    borderWidth: 0,
                                    flex: 1,
                                    width: "95%",
                                }}
                                dropDownContainerStyle={{
                                    backgroundColor: "#FFF5F5",
                                    width: "95%",
                                }}
                                placeholderStyle={{
                                    fontFamily: "Kanit_400Regular",
                                    fontSize: 16,
                                    color: "#A6A6A6",
                                }}
                                labelStyle={{
                                    fontFamily: "Kanit_400Regular",
                                    fontSize: 16,
                                    color: "black",
                                }}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.modalBtn}
                                onPress={confirmSuspended}
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
        padding: 10,
    },
    profileImage: {
        width: 60, 
        height: 60, 
        objectFit: "cover", 
        borderRadius: 10, 
        elevation: 5,
    },
    username: {
        fontSize: 14,
        fontFamily: "Kanit_600SemiBold",
        paddingLeft: 10,
        paddingTop: 5,
    },
    listContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5,
        marginBottom: 6,
        paddingVertical: 10,
    },
    listContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    leftContainer: {
        width: "70%", 
        borderRightWidth: 1,
        borderRightColor: "#CCCCCC",
    },
    leftContent: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    badge: {
        backgroundColor: "#1CE15E",
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontFamily: "Kanit_400Regular",
        fontSize: 12,
        borderRadius: 5,
        color: "white"
    },
    rightContainer: {
        paddingHorizontal: 5,
        width: "30%",
        gap: 2,
    },
    headerText: {
        fontSize: 12,
        fontFamily: "Kanit_600SemiBold",
    },
    text: {
        fontSize: 14,
        fontFamily: "Kanit_400Regular",
    },
    btn: {
        height: 30,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        color: "black",
        fontFamily: "Kanit_400Regular",
        fontSize: 12
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 5,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "80%",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 20,
        fontFamily: "Kanit_400Regular",
    },
    searchBtn: {
        backgroundColor: "#5C77FE", 
        justifyContent: "center", 
        width: "20%", 
        alignItems: "center", 
        borderRadius: 8, 
        height: 50,
    },
    searchBtnText: {
        color: "white",
        fontFamily: "Kanit_400Regular",
        fontSize: 16
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
        fontSize: 16,
        marginBottom: 10,
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10
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
    modalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 5,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "100%",
    },
    modalInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
});
