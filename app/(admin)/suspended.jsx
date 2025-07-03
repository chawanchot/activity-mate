import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    FlatList,
    RefreshControl,
    Image,
    TextInput,
    TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

export default function Suspended() {
    const [refreshing, setRefreshing] = useState(false);
    const [suspendedData, setSuspendedData] = useState([]);
    const [search, setSearch] = useState("");

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
    };

    const getSuspended = async () => {
        try {
            const getData = await firestore().collection("suspended").get();

            // ใช้ Promise.all เพื่อรอทุก async ใน loop
            const suspendeds = await Promise.all(
                getData.docs.map(async (doc) => {
                    let suspendedData = doc.data();

                    const userDoc = await firestore()
                        .collection("users")
                        .doc(suspendedData.userID)
                        .get();
                    const userData = userDoc.data();

                    const startDate = formatDateTime(
                        suspendedData.suspendedStart
                    );
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

            // เรียงตาม startDate ล่าสุดขึ้นก่อน
            suspendeds.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

            // กรองข้อมูลตาม search
            const filtered = suspendeds.filter((item) =>
                item.username.toLowerCase().includes(search.toLowerCase())
            );

            // อัปเดต state
            setSuspendedData(filtered);
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="search" size={24} color="#A6A6A6" />
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
                    onPress={getSuspended}
                >
                    <Text style={styles.searchBtnText}>ค้นหา</Text>
                </TouchableOpacity>
            </View>

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
                                <Text style={styles.username}>
                                    {item.username}
                                </Text>
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
                                <Text style={styles.headerText}>
                                    เหตุผลการระงับ
                                </Text>
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
        fontSize: 16,
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
        paddingVertical: 10,
        alignItems: "center",
        gap: 10,
    },
    username: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    dateContainer: {
        paddingVertical: 2,
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
        width: 50,
        height: 50,
        objectFit: "cover",
        borderRadius: 10,
        elevation: 5,
    },
});
