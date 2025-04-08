import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";

export default function MemberSeachActivity() {
    const params = useLocalSearchParams();

    const [open, setOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [categories, setCategories] = useState([]);
    const [activityList, setActivityList] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [searchProvice, setSearchProvice] = useState("");
    const [searchDistrict, setSearchDistrict] = useState("");
    const [searchSubDistrict, setSearchSubDistrict] = useState("");

    const getActivity = async () => {
        setIsLoading(true);
        try {
            let query = firestore()
                .collection("activities")
                .where("status", "==", "ongoing");

            if (selectedCategory !== "all") {
                query = query.where("categoryID", "==", selectedCategory);
            }

            if (searchProvice) {
                query = query.where("provice", "==", searchProvice)
            }

            if (searchDistrict) {
                let search = searchProvice !== "กรุงเทพมหานคร" ? "อำเภอ" + searchDistrict : searchDistrict;
                query = query.where("district", "==", search)
            }

            if (searchSubDistrict) {
                let prefix = searchProvice !== "กรุงเทพมหานคร" ? "ตำบล" : "แขวง";
                query = query.where("subDistrict", "==", prefix + searchSubDistrict)
            }

            const fetchActivity = await query.get();

            const dataActivity = [];

            for (const doc of fetchActivity.docs) {
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

                if (data.name.toLowerCase().includes(search.toLocaleLowerCase())) {
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
                        registrations: allRegistrationsData.length,
                    });
                }
            }

            setActivityList(dataActivity);
        } catch (error) {
            console.log("fetch activity list error: ", error);
        }
        setIsLoading(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        getActivity();
        setRefreshing(false);
    };

    useEffect(() => {
        setSearchProvice(params.provice);
        setSearchDistrict(params.district);
        setSearchSubDistrict(params.subdistrict);
    }, [params.provice, params.district, params.subdistrict]);    

    useEffect(() => {
        getActivity();

        const getCategory = firestore()
            .collection("category")
            .where("status", "!=", false)
            .onSnapshot(
                (snapshot) => {
                    const dataCategory = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setCategories(dataCategory);
                },
                (error) => {
                    console.error("Error fetching category: ", error);
                }
            );

        // หยุดการติดตามข้อมูลใน firestore
        return () => getCategory();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={{ paddingHorizontal: 10 }}>
                    {/* ชื่อกิจกรรม */}
                    <Text style={styles.label}>ชื่อกิจกรรม</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="#A6A6A6"
                        />
                        <TextInput style={styles.input} onChangeText={setSearch} />
                    </View>

                    {/* สถานที่และหมวดหมู่ */}
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {/* สถานที่ */}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>สถานที่</Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.inputContainer, { flex: 1 }]}
                                onPress={() => router.push({
                                    pathname: "/searchEventLocation",
                                    params: {
                                        backRoute: "/seachActivity"
                                    }
                                })}
                            >
                                <MaterialIcons
                                    name="location-on"
                                    size={24}
                                    color="#A6A6A6"
                                />
                                <Text style={styles.placeText} numberOfLines={1}>
                                    {searchProvice} {searchDistrict} {searchSubDistrict}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* หมวดหมู่ */}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>หมวดหมู่</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome5
                                    name="layer-group"
                                    size={16}
                                    color="#A6A6A6"
                                />
                                <DropDownPicker
                                    open={open}
                                    value={selectedCategory}
                                    items={[
                                        // เพิ่มตัวเลือก "ทั้งหมด" เข้าไปเป็น item แรก
                                        {
                                            label: "ทั้งหมด",
                                            value: "all",
                                        },
                                        // ตามด้วย categories อื่นๆ
                                        ...categories
                                            .filter(
                                                (category) =>
                                                    category.status === true
                                            )
                                            .map((category) => ({
                                                label: category.name,
                                                value: category.id,
                                            })),
                                    ]}
                                    setOpen={setOpen}
                                    setValue={setSelectedCategory}
                                    placeholder=""
                                    style={{
                                        backgroundColor: "#FFF5F5",
                                        borderWidth: 0,
                                        flex: 1,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: "#FFF5F5",
                                    }}
                                    labelStyle={{
                                        fontFamily: "Kanit_400Regular",
                                        fontSize: 18,
                                        color: "black",
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={getActivity}>
                        <Text style={styles.buttonText}>ค้นหา</Text>
                    </TouchableOpacity>
                </View>
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
                    <FlatList
                        data={activityList}
                        renderItem={({ item }) => (
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
                                    {/* Header: จำนวนผู้เข้าร่วม */}
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
                                            <Text style={styles.activityHead}>
                                                {item.registrations}/{item.max}
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
                                    <Text
                                        style={styles.activityDetail}
                                        numberOfLines={2}
                                    >
                                        {item.description}
                                    </Text>

                                    <View style={styles.activityFooter}>
                                        {/* หมวดหมู่ */}
                                        <Text style={styles.activityCategory}>
                                            {item.category}
                                        </Text>

                                        {/* สถานที่ */}
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
                                            <Text style={styles.activityPlace}>
                                                {item.locationName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 5,
    },
    label: {
        fontFamily: "Kanit_400Regular",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 5,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 20,
        fontFamily: "Kanit_400Regular",
    },
    placeText: {
        padding: 3,
        fontSize: 20,
        fontFamily: "Kanit_400Regular",
    },
    placeCateContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    placeCateInput: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        borderRadius: 10,
        height: 55,
        paddingHorizontal: 10,
    },
    listContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5,
        marginBottom: 5,
        padding: 8,
        height: 150,
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
    button: {
        marginVertical: 10,
        backgroundColor: "#3B82F6",
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    buttonText: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
        color: "white",
    },
});
