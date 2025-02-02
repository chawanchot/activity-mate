import { 
    StyleSheet, 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    FlatList, 
    Alert, 
    ActivityIndicator,
    RefreshControl
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

export default function MemberHome() {
    const { user, loggedIn } = useAuth();

    const [tab, setTab] = useState("owner");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [activityList, setActivityList] = useState([]);

    const logout = () => {
        Alert.alert("ออกจากระบบ", "ยืนยันการออกจากระบบ", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    auth()
                        .signOut()
                        .catch((error) =>
                            console.log("Error signing out: ", error)
                        ),
            },
        ]);
    };

    const getOwnerActivity = async () => {
        setIsLoading(true);
        try {
            const getData = await firestore()
                .collection("activities")
                .where("createdByUserID", "==", user.uid)
                .orderBy("startDate", "asc")
                .get();

            const dataActivity = [];

            for (const doc of getData.docs) {
                const data = doc.data();

                // ดึง category จาก categoryID
                const getCategory = await firestore()
                    .collection("category")
                    .doc(data.categoryID)
                    .get();

                const category = getCategory.data();

                const firebaseTimestamp = new firestore.Timestamp(
                    data.startDate.seconds,
                    data.startDate.nanoseconds
                );
                const datetime = firebaseTimestamp.toDate();

                const formattedDate = datetime.toLocaleString("th-TH", {
                    timeZone: "Asia/Bangkok",
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });

                dataActivity.push({
                    id: doc.id,
                    name: data.name,
                    category: category.name,
                    description: data.description,
                    max: data.max,
                    locationName: data.locationName,
                    subdistric: data.subdistric,
                    distric: data.distric,
                    provice: data.provice,
                    startDate: formattedDate,
                });
            }

            setActivityList(dataActivity);
        } catch (error) {
            console.log("fetch Data error: ", error)
        }
        setIsLoading(false);
    };

    const onRefresh = () => {
        setRefreshing(true);

        getOwnerActivity();

        setRefreshing(false);
    };

    useEffect(() => {
        if (tab === "owner") {
            getOwnerActivity();
        } else {
            setActivityList([]);
        }
    }, [tab]);

    // ออกจากระบบให้กลับไปหน้า login
    useEffect(() => {
        if (!loggedIn) {
            router.replace("/login");
        }
    }, [loggedIn]);

    if (!user) {
        return null; // หยุดการเรนเดอร์เมื่อ user เป็น null
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* โปรไฟล์ */}
                <View style={styles.headerContainer}>
                    {/* รูปโปรไฟล์ */}
                    <Image
                        source={{ uri: user.profilePicture }}
                        style={styles.profileImg}
                    />
                    {/* ชื่อผู้ใช้และปุ่ม */}
                    <View style={{ marginTop: 10 }}>
                        {/* ชื่อผู้ใช้ */}
                        <Text style={styles.username}>{user.username}</Text>
                        <View style={styles.buttonContainer}>
                            {/* ปุ่มแก้ไขข้อมูล */}
                            <TouchableOpacity onPress={() => router.push("/editProfile")}>
                                <Text style={styles.profileEditBtn}>แก้ไขข้อมูล</Text>
                            </TouchableOpacity>
                            {/* ปุ่มออกจากระบบ */}
                            <TouchableOpacity onPress={logout}>
                                <Text style={styles.profileLogoutBtn}>ออกจากระบบ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* แท็บ */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setTab("join")}
                        style={[styles.tab, tab === "join" && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, tab === "join" && styles.activeTabText]}>
                            การเข้าร่วม
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab("owner")}
                        style={[styles.tab, tab === "owner" && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, tab === "owner" && styles.activeTabText]}>
                            กิจกรรมที่จัด
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* กำลังโหลดข้อมูล */}
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={{ fontFamily: "Kanit_600SemiBold", marginTop: 10 }}>กำลังโหลดข้อมูล...</Text>
                    </View>
                ) : (
                    // รายการกิจกรรม
                    <FlatList
                        data={activityList}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                activeOpacity={0.8} 
                                onPress={() => router.push({
                                    pathname: "activityDetail",
                                    params: {
                                        id: item.id
                                    }
                                })}
                            >
                                <View style={styles.listContainer}>
                                    {/* Header: จำนวนผู้เข้าร่วม */}
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                            <AntDesign name="user" color="black" size={14} />
                                            <Text style={styles.activityHead}>
                                                1/{item.max}
                                            </Text>
                                        </View>
                                        <Text style={styles.activityHead}>
                                            {item.startDate}
                                        </Text>
                                    </View>

                                    {/* ชื่อกิจกรรม */}
                                    <Text style={styles.activityName}>
                                        {item.name}
                                    </Text>

                                    {/* คำอธิบายกิจกรรม */}
                                    <Text style={styles.activityDetail} numberOfLines={2}>
                                        {item.description}
                                    </Text>

                                    <View style={styles.activityFooter}>
                                        {/* หมวดหมู่ */}
                                        <Text style={styles.activityCategory}>
                                            {item.category}
                                        </Text>

                                        {/* สถานที่ */}
                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                            <MaterialIcons name="location-on" color="black" size={18} />
                                            <Text style={styles.activityPlace}>
                                                {item.locationName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 8}}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%", 
        backgroundColor: "white", 
        paddingTop: 18
    },
    headerContainer: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    username: {
        margin: "auto",
        fontFamily: "Kanit_600SemiBold",
        fontSize: 22,
    },
    buttonContainer: {
        flexDirection: "row", 
        justifyContent: "center", 
        gap: 50,
        marginTop: 10
    },
    profileEditBtn: {
        fontFamily: "Kanit_600SemiBold",
        color: "blue"
    },
    profileLogoutBtn: {
        fontFamily: "Kanit_600SemiBold",
        color: "red",
    },
    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#9CA3AF",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        padding: 8,
        },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "black",
    },
    tabText: {
        color: "#9CA3AF",
        fontFamily: "Kanit_400Regular",
    },
    activeTabText: {
        color: "black",
        fontFamily: "Kanit_600SemiBold",
    },
    profileImg: {
        width: 120,
        height: 120,
        objectFit: "contain",
        borderRadius: 15,
        elevation: 4
    },
    listContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5,
        marginBottom: 5,
        padding: 8,
        height: 150
    },
    activityHead: {
        color: "#6b7280",
        fontSize: 14,
        marginLeft: 4,
        fontFamily: "Kanit_600SemiBold"
    },
    activityName: {
        fontFamily: "Kanit_700Bold",
        color: "black",
        fontSize: 18,
        marginBottom: 4,
    },
    activityDetail: {
        color: "#57595c",
        fontSize: 14,
        fontFamily: "Kanit_600SemiBold"
    },
    activityFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "auto"
    },
    activityCategory: {
        fontSize: 12,
        color: "white",
        backgroundColor: "#ef4444",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontFamily: "Kanit_600SemiBold"
    },
    activityPlace: {
        color: "#57595c",
        fontSize: 14,
        fontFamily: "Kanit_400Regular"
    }
})
