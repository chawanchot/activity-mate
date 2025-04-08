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

export default function Report() {
    const [refreshing, setRefreshing] = useState(false);
    const [reportsData, setReportsData] = useState([]);

    // function ดึงข้อมูลชื่อผู้ใช้จาก userID
    const getUsername = async (id) => {
        try {
            const userDoc = await firestore().collection("users").doc(id).get();
            
            if (userDoc.exists) {
                return userDoc.data().username;
            }

            return "Unknow User"; // กรณีไม่พบผู้ใช้
        } catch (error) {
            console.log("fetch Username error: ", error)
        }
    }

    const getReport = async () => {
        try {
            const getData = await firestore().collection("reports").get();

            // ใช้ Promise.all เพื่อรอทุก async ใน loop
            const reports = await Promise.all(
                getData.docs.map(async (doc) => {
                    let reportData = doc.data();

                    const reportBy = await getUsername(reportData.reportByUserID);
                    const username = await getUsername(reportData.userID);

                    const datetime = reportData.createdAt.toDate();
                    const formattedDateTime = datetime.toLocaleString(
                        "th-TH",
                        {
                            timeZone: "Asia/Bangkok",
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    );

                    return {
                        id: doc.id,
                        ...reportData,
                        username: username,
                        reportBy: reportBy,
                        datetime: formattedDateTime,
                    };
                })
            );

            setReportsData(reports);
        } catch (error) {
            console.log("fetch Data error: ", error)
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        getReport();
        setRefreshing(false);
    };

    useEffect(() => {
        getReport();
    }, [])

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
                            <View style={styles.leftContainer}>
                                <View style={[styles.leftContent, { borderBottomWidth: 1, borderBottomColor: "#CCCCCC" }]}>
                                    <Text style={styles.headerText}>ผู้รายงาน</Text>
                                    <Text style={styles.text}>{item.reportBy}</Text>
                                </View>
                                <View style={styles.leftContent}>
                                    <Text style={styles.headerText}>ผู้ถูกรายงาน</Text>
                                    <Text style={styles.text}>{item.username}</Text>
                                </View>
                            </View>
                            <View style={styles.rightContainer}>
                                <View style={[styles.rightContent, { borderBottomWidth: 1, borderBottomColor: "#CCCCCC" }]}>
                                    <Text style={styles.headerText}>รายละเอียด</Text>
                                    <Text style={styles.text}>{item.reason}</Text>
                                </View>
                                <View style={styles.rightContent}>
                                    <Text style={styles.headerText}>ผลการตรวจสอบ</Text>
                                    <Text style={styles.text}>{item.inspection}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.btn,{ backgroundColor: "#00E5FF", width: "60%" }]}
                            >
                                <Text style={styles.btnText}>
                                    ดูกลุ่มสนทนา
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.btn,{ backgroundColor: "#FFC300", width: "40%" }]}
                            >
                                <Text style={styles.btnText}>
                                    บันทึกการตรวจสอบ
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
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
        paddingVertical: 5,
    },
    dateText: {
        fontSize: 12,
        fontFamily: "Kanit_400Regular",
        position: "absolute", 
        right: 10, 
        top: 3,
    },
    listContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    leftContainer: {
        width: "30%", 
        borderRightWidth: 1, 
        borderRightColor: "#CCCCCC"
    },
    rightContainer: {
        width: "70%",
    },
    leftContent: {
        alignItems: "center",
        paddingVertical: 4,
    },
    rightContent: {
        paddingVertical: 4,
        paddingHorizontal: 10,
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
});
