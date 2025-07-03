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
import DropDownPicker from "react-native-dropdown-picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {
    MaterialIcons,
    MaterialCommunityIcons,
    AntDesign,
} from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";

export default function Report() {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toggleCheckBox, setToggleCheckBox] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [reportsData, setReportsData] = useState([]);
    const [inspectionText, setInspectionText] = useState("");
    const [suspendedReason, setSuspendedReason] = useState("");
    const [suspendedDate, setSuspendedDate] = useState("");
    const [suspendedSelected, setSuspendedSelected] = useState(null);
    const [reportSelected, setReportSelected] = useState(null);

    // function ดึงข้อมูลชื่อผู้ใช้จาก userID
    const getUsername = async (id) => {
        try {
            const userDoc = await firestore().collection("users").doc(id).get();

            if (userDoc.exists) {
                return userDoc.data().username;
            }

            return "Unknow User"; // กรณีไม่พบผู้ใช้
        } catch (error) {
            console.log("fetch Username error: ", error);
        }
    };

    const getReport = async () => {
        try {
            const getData = await firestore().collection("reports").get();

            // ใช้ Promise.all เพื่อรอทุก async ใน loop
            const reports = await Promise.all(
                getData.docs.map(async (doc) => {
                    let reportData = doc.data();

                    const reportBy = await getUsername(
                        reportData.reportByUserID
                    );
                    const username = await getUsername(reportData.userID);

                    const messageDoc = await firestore()
                        .collection("groupchats")
                        .doc(reportData.messageID)
                        .get();
                    const activityId = messageDoc.data().activityID;

                    const datetime = reportData.createdAt.toDate();
                    const formattedDateTime = datetime.toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    });

                    return {
                        id: doc.id,
                        ...reportData,
                        username: username,
                        reportBy: reportBy,
                        datetime: formattedDateTime,
                        activityId: activityId,
                    };
                })
            );

            reports.sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate()));

            setReportsData(reports);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
    };

    const confirmInspection = async () => {
        if (inspectionText) {
            try {
                await firestore()
                    .collection("reports")
                    .doc(reportSelected)
                    .update({
                        status: true,
                        inspection: inspectionText,
                    });
            } catch (error) {
                console.error("Error update report or suspended Data:", error);
            }

            if (toggleCheckBox) {
                if (suspendedReason && suspendedDate) {
                    // วันที่ปัจจุบัน
                    const currentDate = new Date();

                    // คำนวณวันที่สิ้นสุดการระงับ
                    const endDate = new Date(currentDate);
                    endDate.setDate(
                        currentDate.getDate() + parseInt(suspendedDate)
                    );

                    try {
                        // เพิ่มข้อมูล suspended
                        await firestore()
                            .collection("suspended")
                            .add({
                                userID: suspendedSelected,
                                reason: suspendedReason,
                                suspendedStart:
                                    firestore.FieldValue.serverTimestamp(),
                                suspendedEnd:
                                    firestore.Timestamp.fromDate(endDate),
                            });

                        getReport();
                    } catch (error) {
                        console.error("Error save suspended Data:", error);
                    }
                } else {
                    Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", [
                        { text: "ตกลง" },
                    ]);
                }
            }

            setSuspendedSelected(null);
            setReportSelected(null);
            setInspectionText("");
            setSuspendedDate("");
            setSuspendedReason("");
            setShowModal(false);
        } else {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", [
                { text: "ตกลง" },
            ]);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        getReport();
        setRefreshing(false);
    };

    const openModal = (reportId, userId) => {
        setSuspendedSelected(userId);
        setReportSelected(reportId);
        setShowModal(true);
    };

    useEffect(() => {
        getReport();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* แสดงรายการหมวดหมู่ทั้งหมด */}
            <FlatList
                data={reportsData}
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
                        <Text style={styles.dateText}>{item.datetime}</Text>
                        <View style={styles.listContent}>
                            {/* ผู้รายงานและผู้ถูกรายงาน */}
                            <View style={styles.userContainer}>
                                <View style={styles.userContent}>
                                    <Text style={styles.headerText}>
                                        ผู้รายงาน
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.reportBy}
                                    </Text>
                                </View>
                                <View style={styles.userContent}>
                                    <Text style={styles.headerText}>
                                        ผู้ถูกรายงาน
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.username}
                                    </Text>
                                </View>
                            </View>

                            {/* รายละเอียดและผลการตรวจสอบ */}
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailContent}>
                                    <Text style={styles.headerText}>
                                        รายละเอียด
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.reason}
                                    </Text>
                                </View>
                                {item.status && (
                                    <View style={styles.detailContent}>
                                        <Text style={styles.headerText}>
                                            ผลการตรวจสอบ
                                        </Text>
                                        <Text style={styles.text}>
                                            {item.inspection}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        {!item.status && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[
                                        styles.btn,
                                        {
                                            backgroundColor: "#00E5FF",
                                            width: "60%",
                                        },
                                    ]}
                                    onPress={() =>
                                        router.push({
                                            pathname: "chat",
                                            params: {
                                                activityID: item.activityId,
                                                messageID: item.messageID,
                                            },
                                        })
                                    }
                                >
                                    <Text style={styles.btnText}>
                                        ดูกลุ่มสนทนา
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[
                                        styles.btn,
                                        {
                                            backgroundColor: "#FFC300",
                                            width: "40%",
                                        },
                                    ]}
                                    onPress={() =>
                                        openModal(item.id, item.userID)
                                    }
                                >
                                    <Text style={styles.btnText}>
                                        บันทึกการตรวจสอบ
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />

            {/* Modal บันทึกการตรวจสอบ */}
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
                        <Text style={styles.modalHeader}>บันทึกการตรวจสอบ</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <View style={styles.modalInputContainer}>
                            <MaterialCommunityIcons
                                name="checkbox-marked-outline"
                                size={24}
                                color="#A6A6A6"
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="ผลการตรวจสอบ"
                                placeholderTextColor="#A6A6A6"
                                value={inspectionText}
                                onChangeText={setInspectionText}
                            />
                        </View>
                        <View style={styles.checkboxContainer}>
                            <BouncyCheckbox
                                disableText
                                isChecked={toggleCheckBox}
                                size={25}
                                fillColor="blue"
                                innerIconStyle={{ borderWidth: 2 }}
                                useBuiltInState={false}
                                onPress={(checked) => {
                                    // These two should be same value
                                    console.log("::Checked::", checked);
                                    console.log(
                                        "::LocalChecked::",
                                        toggleCheckBox
                                    );
                                    setToggleCheckBox(!toggleCheckBox);
                                }}
                            />
                            <Text style={styles.checkboxLabel}>ระงับบัญชี</Text>
                        </View>

                        {toggleCheckBox && (
                            <>
                                <View style={styles.modalInputContainer}>
                                    <AntDesign
                                        name="warning"
                                        size={24}
                                        color="#A6A6A6"
                                    />
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
                            </>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.modalBtn}
                                onPress={confirmInspection}
                            >
                                <Text style={styles.modalBtnText}>ยืนยัน</Text>
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
    listContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5,
        marginBottom: 6,
        paddingTop: 15,
    },
    dateText: {
        fontSize: 12,
        fontFamily: "Kanit_400Regular",
        position: "absolute",
        right: 10,
        top: 3,
    },
    listContent: {
        flexDirection: "column", // เปลี่ยนเป็น column เพื่อให้ส่วนต่างๆ เรียงจากบนลงล่าง
        paddingHorizontal: 10,
    },
    userContainer: {
        flexDirection: "row", // ผู้รายงานและผู้ถูกรายงานอยู่ในบรรทัดเดียวกัน
        justifyContent: "space-between", // กระจายพื้นที่ให้เท่ากัน
        borderBottomWidth: 1,
        borderBottomColor: "#CCCCCC",
        paddingVertical: 4,
    },
    userContent: {
        flex: 1, // ให้แต่ละส่วนใช้พื้นที่เท่ากัน
        alignItems: "center",
    },
    detailsContainer: {
        flexDirection: "column", // รายละเอียดและผลการตรวจสอบเรียงจากบนลงล่าง
        paddingVertical: 4,
    },
    detailContent: {
        paddingVertical: 4,
    },
    headerText: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    text: {
        fontSize: 14,
        fontFamily: "Kanit_400Regular",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 10,
        paddingVertical: 5,
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        elevation: 5,
        padding: 14,
        width: "80%",
        minHeight: 85,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    modalHeader: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
        marginBottom: 10,
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    modalFooter: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 14,
    },
    modalBtn: {
        marginBottom: 2,
        backgroundColor: "#5476FF",
        width: 62,
        height: 35,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    modalBtnText: {
        color: "white",
        fontFamily: "Kanit_600SemiBold",
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
    checkboxContainer: {
        flexDirection: "row",
        marginVertical: 8,
    },
    checkboxLabel: {
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
        marginLeft: 8,
    },
});
