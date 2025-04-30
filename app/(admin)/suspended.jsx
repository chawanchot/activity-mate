import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    FlatList,
    RefreshControl,
    Image,
} from "react-native";
import firestore from "@react-native-firebase/firestore";

export default function Suspended() {
    const [refreshing, setRefreshing] = useState(false);
    const [suspendedData, setSuspendedData] = useState([]);

    const formatDateTime = (data) => {
        const datetime = data.toDate();
        const formatted = datetime.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return formatted;
    }

    const getSuspended = async () => {
        try {
            const getData = await firestore().collection("suspended").get();

            // ใช้ Promise.all เพื่อรอทุก async ใน loop
            const suspendeds = await Promise.all(
                getData.docs.map(async (doc) => {
                    let suspendedData = doc.data();

                    const userDoc = await firestore().collection("users").doc(suspendedData.userID).get();
                    const userData = userDoc.data();

                    const startDate = formatDateTime(suspendedData.suspendedStart);
                    const endDate = formatDateTime(suspendedData.suspendedEnd);

                    return {
                        id: doc.id,
                        username: userData.username,
                        startDate: startDate,
                        endDate: endDate,
                        reason: suspendedData.reason,
                        profilePicture: userData.profilePicture,
                    };
                })
            );

            setSuspendedData(suspendeds);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        getSuspended();
        setRefreshing(false);
    };

    useEffect(() => {
        getSuspended();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* แสดงรายการหมวดหมู่ทั้งหมด */}
            <FlatList
                data={suspendedData}
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
                            {/* ผู้รายงานและผู้ถูกรายงาน */}
                            <View style={styles.userContainer}>
                                <Image 
                                    source={{ uri: item.profilePicture }} 
                                    style={styles.profileImage}
                                />
                                <Text style={styles.username}>{item.username}</Text>
                            </View>

                            {/* วันที่ */}
                            <View style={styles.dateContainer}>
                                <View style={styles.dateList}>
                                    <Text style={styles.headerText}>
                                        เริ่มระงับ:
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.startDate}
                                    </Text>
                                </View>
                                <View style={styles.dateList}>
                                    <Text style={styles.headerText}>
                                        สิ้นสุด:
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.endDate}
                                    </Text>
                                </View>
                            </View>

                            {/* เหตุผลการระงับ */}
                            <View style={styles.reasonContainer}>
                                <Text style={styles.headerText}>เหตุผลการระงับ</Text>
                                <Text style={styles.text}>{item.reason}</Text>
                            </View>
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
    },
    listContent: {
        flexDirection: "column",
        paddingHorizontal: 10,
    },
    userContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#CCCCCC",
        paddingVertical: 10,
        alignItems: "center",
        gap: 10,
    },
    username: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    dateContainer: {
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#CCCCCC",
    },
    dateList: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    headerText: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    text: {
        fontSize: 14,
        fontFamily: "Kanit_400Regular",
    },
    reasonContainer: {
        paddingVertical: 5,
    },
    profileImage: {
        width: 60, 
        height: 60, 
        objectFit: "cover", 
        borderRadius: 10, 
        elevation: 5,
    },
});
