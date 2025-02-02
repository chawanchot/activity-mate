import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";

export default function MemberSeachActivity() {

    const [open, setOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [categories, setCategories] = useState([]);
    const [activityList, setActivityList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const getCategory = async () => {
        const fetchCategory = await firestore()
            .collection("category")
            .where("status", "==", true)
            .get()

        const dataCategory = [];

        for (const doc of fetchCategory.docs) {
            const data = doc.data();

            dataCategory.push({
                id: doc.id,
                ...data
            });
        }

        setCategories(dataCategory);
    }

    const getActivity = async () => {
        try {
            const fetchActivity = await firestore()
            .collection("activities")
            .orderBy("startDate", "asc")
            .get()

            const dataActivity = [];

            for (const doc of fetchActivity.docs) {
                const data = doc.data()

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
            console.log("fetch activity list error: ", error)
        }
    }

    const onRefresh = () => {
        setRefreshing(true);

        getCategory();
        getActivity();

        setRefreshing(false);
    };

    useEffect(() => {
        getCategory();
        getActivity();
    }, [])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={{ paddingHorizontal: 8, paddingTop: 2 }}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="search" size={24} color="#A6A6A6" />
                        <TextInput style={styles.input} />
                    </View>

                    {/* สถานที่และหมวดหมู่ */}
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {/* สถานที่ */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.inputContainer, { flex: 1 }]}
                        >
                            <MaterialIcons name="location-on" size={24} color="#A6A6A6" />
                        </TouchableOpacity>

                        {/* หมวดหมู่ */}
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <FontAwesome5 name="layer-group" size={16} color="#A6A6A6" />
                            <DropDownPicker
                                open={open}
                                value={selectedCategory}
                                items={categories
                                    .filter((category) => category.status === true)
                                    .map((category) => ({
                                        label: category.name,
                                        value: category.id,
                                    }))}
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingVertical: 10,
    },
    label: {
        fontFamily: "Kanit_400Regular"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 10,
        borderRadius: 10,
        height: 55,
        paddingHorizontal: 10,
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: 10,
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
});
