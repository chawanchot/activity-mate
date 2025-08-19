import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

export default function MemberHome() {
    const { user, loggedIn, page, setPage } = useAuth();

    const [tab, setTab] = useState("owner");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const [activityList, setActivityList] = useState([]);

    const logout = () => {
        setMenuVisible(false);
        Alert.alert("แจ้งเตือน", "ยืนยันการออกจากระบบ", [
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

                // จำนวนคนเข้าร่วมทั้งหมด
                const allRegistrations = await firestore()
                    .collection("registrations")
                    .where("activityID", "==", doc.id)
                    .get();

                const allRegistrationsData = allRegistrations.docs;

                dataActivity.push({
                    id: doc.id,
                    name: data.name,
                    category: category.name,
                    categoryColor: category.color,
                    description: data.description,
                    max: data.max,
                    status: data.status,
                    locationName: data.locationName,
                    subdistric: data.subdistric,
                    distric: data.distric,
                    provice: data.provice,
                    startDate: formattedDate,
                    registrations: allRegistrationsData.length,
                    img: data.image,
                });
            }

            const ongoingActivities = dataActivity.filter(
                (a) => a.status === "ongoing"
            );
            const endedActivities = dataActivity.filter(
                (a) => a.status === "success"
            );
            const cancelActivities = dataActivity.filter(
                (a) => a.status === "cancel"
            );

            const mergedList = [];

            if (ongoingActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "กำลังดำเนินการ",
                    key: "ongoing",
                });
                mergedList.push(...ongoingActivities);
            }

            if (endedActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "สิ้นสุด",
                    key: "ended",
                });
                mergedList.push(...endedActivities);
            }

            if (cancelActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "ยกเลิก",
                    key: "cancel",
                });
                mergedList.push(...cancelActivities);
            }

            setActivityList(mergedList);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
        setIsLoading(false);
    };

    const getRegisteredActivity = async () => {
        setIsLoading(true);
        try {
            const getRegisteredData = await firestore()
                .collection("registrations")
                .where("userID", "==", user.uid)
                .get();

            const dataActivity = [];

            for (const doc of getRegisteredData.docs) {
                const data = doc.data();

                const getActivityData = await firestore()
                    .collection("activities")
                    .doc(data.activityID)
                    .get();

                const activityData = getActivityData.data();

                // ดึง category จาก categoryID
                const getCategory = await firestore()
                    .collection("category")
                    .doc(activityData.categoryID)
                    .get();

                const category = getCategory.data();

                const firebaseTimestamp = new firestore.Timestamp(
                    activityData.startDate.seconds,
                    activityData.startDate.nanoseconds
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

                // จำนวนคนเข้าร่วมทั้งหมด
                const allRegistrations = await firestore()
                    .collection("registrations")
                    .where("activityID", "==", data.activityID)
                    .get();

                const allRegistrationsData = allRegistrations.docs;

                dataActivity.push({
                    id: data.activityID,
                    name: activityData.name,
                    category: category.name,
                    categoryColor: category.color,
                    description: activityData.description,
                    max: activityData.max,
                    status: activityData.status,
                    locationName: activityData.locationName,
                    subdistric: activityData.subdistric,
                    distric: activityData.distric,
                    provice: activityData.provice,
                    startDate: formattedDate,
                    registrations: allRegistrationsData.length,
                    img: activityData.image,
                });
            }

            const ongoingActivities = dataActivity.filter(
                (a) => a.status === "ongoing"
            );
            const endedActivities = dataActivity.filter(
                (a) => a.status === "success"
            );
            const cancelActivities = dataActivity.filter(
                (a) => a.status === "cancel"
            );

            const mergedList = [];

            if (ongoingActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "กำลังดำเนินการ",
                    key: "ongoing",
                });
                mergedList.push(...ongoingActivities);
            }

            if (endedActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "สิ้นสุด",
                    key: "ended",
                });
                mergedList.push(...endedActivities);
            }

            if (cancelActivities.length > 0) {
                mergedList.push({
                    type: "header",
                    title: "ยกเลิก",
                    key: "cancel",
                });
                mergedList.push(...cancelActivities);
            }

            setActivityList(mergedList);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
        setIsLoading(false);
    };

    const onRefresh = () => {
        setRefreshing(true);

        if (tab === "owner") {
            getOwnerActivity();
        } else {
            getRegisteredActivity();
        }

        setRefreshing(false);
    };

    useEffect(() => {
        if (tab === "owner") {
            getOwnerActivity();
        } else {
            getRegisteredActivity();
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
                    </View>
                </View>

                {/* แท็บ */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setTab("join")}
                        style={[styles.tab, tab === "join" && styles.activeTab]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "join" && styles.activeTabText,
                            ]}
                        >
                            การเข้าร่วม
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab("owner")}
                        style={[
                            styles.tab,
                            tab === "owner" && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "owner" && styles.activeTabText,
                            ]}
                        >
                            กิจกรรมที่จัด
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* กำลังโหลดข้อมูล */}
                {isLoading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text
                            style={{
                                fontFamily: "Kanit_600SemiBold",
                                marginTop: 10,
                            }}
                        >
                            กำลังโหลดข้อมูล...
                        </Text>
                    </View>
                ) : (
                    // รายการกิจกรรม
                    <FlatList
                        data={activityList}
                        renderItem={({ item }) => {
                            if (item.type === "header") {
                                return (
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginVertical: 3,
                                            marginHorizontal: 8,
                                        }}
                                    >
                                        {/* เส้นซ้าย */}
                                        <View
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                backgroundColor: "#ccc",
                                            }}
                                        />

                                        {/* ข้อความ header */}
                                        <Text
                                            style={{
                                                marginHorizontal: 12,
                                                fontSize: 14,
                                                fontFamily: "Kanit_700Bold",
                                                color: "#333",
                                            }}
                                        >
                                            {item.title}
                                        </Text>

                                        {/* เส้นขวา */}
                                        <View
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                backgroundColor: "#ccc",
                                            }}
                                        />
                                    </View>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        router.push({
                                            pathname: "activityDetail",
                                            params: {
                                                id: item.id,
                                            },
                                        })
                                    }
                                >
                                    <View style={styles.listContainer}>
                                        {item.status === "cancel" && (
                                            <View style={styles.overlay}>
                                                <Text style={styles.cancelText}>
                                                    กิจกรรมถูกยกเลิก
                                                </Text>
                                            </View>
                                        )}

                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <AntDesign
                                                    name="user"
                                                    color="black"
                                                    size={14}
                                                />
                                                <Text
                                                    style={styles.activityHead}
                                                >
                                                    {item.registrations}/
                                                    {item.max}
                                                </Text>
                                            </View>
                                            <Text style={styles.activityHead}>
                                                {item.startDate}
                                            </Text>
                                        </View>

                                        {/* รูปกิจกรรม */}
                                        {item.img && (
                                            <Image
                                                source={{ uri: item.img }}
                                                style={styles.activityImage}
                                            />
                                        )}

                                        <Text style={styles.activityName}>
                                            {item.name}
                                        </Text>

                                        <Text
                                            style={styles.activityDetail}
                                            numberOfLines={2}
                                        >
                                            {item.description}
                                        </Text>

                                        <View style={styles.activityFooter}>
                                            <Text style={[styles.activityCategory, { backgroundColor: item.categoryColor }]}>
                                                {item.category}
                                            </Text>

                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <MaterialIcons
                                                    name="location-on"
                                                    color="black"
                                                    size={18}
                                                />
                                                <Text
                                                    style={styles.activityPlace}
                                                >
                                                    {item.locationName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        keyExtractor={(item, index) =>
                            item.key ?? item.id ?? index.toString()
                        }
                        contentContainerStyle={{ padding: 8 }}
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

            {/* ✅ ปุ่มเมนู 3 จุด ลอยอยู่ขวาบน ไม่ดันอะไรลง */}
            <TouchableOpacity
                style={styles.floatingMenuButton}
                onPress={() => setMenuVisible(true)}
            >
                <MaterialIcons name="more-vert" size={28} color="black" />
            </TouchableOpacity>

            {/* ✅ Modal Dropdown Menu (เหมือนเดิม) */}
            <Modal
                transparent
                animationType="fade"
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)} activeOpacity={0.8}>
                    <View style={styles.menuContainer}>
                        {user.role === "admin" && (
                            <TouchableOpacity onPress={() => { 
                                router.replace('/(admin)/home'); 
                                setPage("admin");
                                setMenuVisible(false); 
                            }}>
                                <Text style={styles.menuItem}>สลับไปหน้าแอดมิน</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => {
                            setMenuVisible(false);
                            router.push("/userTickets");
                        }}>
                            <Text style={[styles.menuItem]}>
                                กล่องข้อความ
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { 
                            router.push('/editProfile'); 
                            setMenuVisible(false); 
                        }}>
                            <Text style={styles.menuItem}>แก้ไขข้อมูล</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout}>
                            <Text style={[styles.menuItem, { color: 'red' }]}>ออกจากระบบ</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        backgroundColor: "white",
        paddingTop: 18,
    },
    floatingMenuButton: {
        position: 'absolute',
        top: 10,
        right: 16,
        zIndex: 1000,
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 16,
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        width: 150,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontFamily: "Kanit_400Regular",
        fontSize: 14,
        color: '#333',
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
    profileEditBtn: {
        fontFamily: "Kanit_600SemiBold",
        color: "blue",
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
        elevation: 4,
    },
    listContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5,
        marginBottom: 5,
        padding: 8,
        height: 160,
        position: "relative", // ทำให้ซ้อนทับได้
        overflow: "hidden",
    },
    activityImage: {
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 15,
        position: "absolute",
        top: 35,
        right: 20,
        elevation: 5,
    },
    activityHead: {
        color: "#6b7280",
        fontSize: 14,
        marginLeft: 4,
        fontFamily: "Kanit_600SemiBold",
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
        fontFamily: "Kanit_600SemiBold",
        width: "70%",
    },
    activityFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "auto",
    },
    activityCategory: {
        fontSize: 12,
        color: "white",
        backgroundColor: "#ef4444",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontFamily: "Kanit_600SemiBold",
    },
    activityPlace: {
        color: "#57595c",
        fontSize: 14,
        fontFamily: "Kanit_400Regular",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject, // ทำให้ครอบคลุมพื้นที่ทั้งหมด
        backgroundColor: "rgba(60, 60, 60, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    cancelText: {
        color: "white",
        fontSize: 24,
        fontFamily: "Kanit_600SemiBold",
    },
});
