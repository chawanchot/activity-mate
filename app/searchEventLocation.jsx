import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import locationData from "../constants/api_province_with_amphure_tambon.json";
import { useEffect, useState } from "react";

export default function ProvinceScreen() {
    const params = useLocalSearchParams();
    const [tab, setTab] = useState("provice");

    const [fillteredDistrict, setFillteredDistrict] = useState([]);
    const [fillteredSubDistrict, setFillteredSubDistrict] = useState([]);

    const [selectedProvice, setSelectedProvice] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedSubDistrict, setSelectedSubDistrict] = useState("");

    const changeTab = (newTab) => {
        if (newTab === "provice") {
            setTab("provice");
        }
        if (newTab === "district") {
            if (selectedProvice === "") {
                Alert.alert("แจ้งเตือน", "กรุณาเลือกจังหวัดก่อน", [
                    { text: "ตกลง" },
                ]);
            } else {
                setTab(newTab);
            }
        }
        if (newTab === "subdistrict") {
            if (selectedDistrict === "") {
                Alert.alert("แจ้งเตือน", "กรุณาเลือกอำเภอก่อน", [
                    { text: "ตกลง" },
                ]);
            } else {
                setTab(newTab);
            }
        }
    };

    const pickProvice = (provice) => {
        setSelectedProvice(provice);
        setSelectedDistrict("");
        setSelectedSubDistrict("");
        const filltered = locationData.filter(
            (item) => item.name_th === provice
        );

        // เรียงตามตัวอักษร
        const sortedDistrict = [...filltered[0].amphure].sort((a, b) =>
            a.name_th.localeCompare(b.name_th)
        );

        setFillteredDistrict(sortedDistrict);
        setTab("district");
    };

    const pickDistrict = (district) => {
        setSelectedDistrict(district);
        setSelectedSubDistrict("");
        const filltered = fillteredDistrict.filter(
            (item) => item.name_th === district
        );

        // เรียงตามตัวอักษร
        const sortedSubDistrict = [...filltered[0].tambon].sort((a, b) =>
            a.name_th.localeCompare(b.name_th)
        );

        setFillteredSubDistrict(sortedSubDistrict);
        setTab("subdistrict");
    };

    const pickSubDistrict = (subdistrict) => {
        setSelectedSubDistrict(subdistrict);
    };

    const confirm = () => {
        router.back(); // กลับไปหน้าเดิม
        setTimeout(() => {
            router.setParams({
                provice: selectedProvice,
                district: selectedDistrict,
                subdistrict: selectedSubDistrict,
            });
        }, 50);
    };

    const clearSearch = () => {
        router.back();
        setTimeout(() => {
            router.setParams({
                provice: "",
                district: "",
                subdistrict: "",
            });
        }, 50);
    };

    return (
        <View style={styles.container}>
            {/* แท็บ */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => changeTab("provice")}
                    style={[styles.tab, tab === "provice" && styles.activeTab]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            tab === "provice" && styles.activeTabText,
                        ]}
                    >
                        จังหวัด
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => changeTab("district")}
                    style={[styles.tab, tab === "district" && styles.activeTab]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            tab === "district" && styles.activeTabText,
                        ]}
                    >
                        อำเภอ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => changeTab("subdistrict")}
                    style={[
                        styles.tab,
                        tab === "subdistrict" && styles.activeTab,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            tab === "subdistrict" && styles.activeTabText,
                        ]}
                    >
                        ตำบล
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ส่วนแสดงข้อมูลและปุ่มค้นหา */}
            <View style={styles.contentContainer}>
                {/* จังหวัด */}
                {tab === "provice" ? (
                    <FlatList
                        data={[...locationData].sort((a, b) =>
                            a.name_th.localeCompare(b.name_th)
                        )} // เรียงจังหวัดตามตัวอักษรก่อนแสดง
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => pickProvice(item.name_th)}
                            >
                                <View style={styles.itemNameContainer}>
                                    {selectedProvice === item.name_th && ( // แสดงไอคอนเมื่อเลือก
                                        <MaterialIcons
                                            name="check"
                                            size={24}
                                            color="blue"
                                        />
                                    )}
                                    <Text style={styles.itemText}>
                                        {item.name_th}
                                    </Text>
                                </View>
                                <MaterialIcons
                                    name="keyboard-arrow-right"
                                    size={24}
                                    color="#A6A6A6"
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                ) : null}

                {/* อำเภอ */}
                {tab === "district" ? (
                    <FlatList
                        data={fillteredDistrict}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => pickDistrict(item.name_th)}
                            >
                                <View style={styles.itemNameContainer}>
                                    {selectedDistrict === item.name_th && ( // แสดงไอคอนเมื่อเลือก
                                        <MaterialIcons
                                            name="check"
                                            size={24}
                                            color="blue"
                                        />
                                    )}
                                    <Text style={styles.itemText}>
                                        {item.name_th}
                                    </Text>
                                </View>
                                <MaterialIcons
                                    name="keyboard-arrow-right"
                                    size={24}
                                    color="#A6A6A6"
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                ) : null}

                {/* ตำบล */}
                {tab === "subdistrict" ? (
                    <FlatList
                        data={fillteredSubDistrict}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => pickSubDistrict(item.name_th)}
                            >
                                <View style={styles.itemNameContainer}>
                                    {selectedSubDistrict === item.name_th && ( // แสดงไอคอนเมื่อเลือก
                                        <MaterialIcons
                                            name="check"
                                            size={24}
                                            color="blue"
                                        />
                                    )}
                                    <Text style={styles.itemText}>
                                        {item.name_th}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                ) : null}
            </View>

            {/* ปุ่มค้นหาที่อยู่ล่างสุด */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#FF2424" }]}
                    onPress={clearSearch}
                >
                    <Text style={styles.buttonText}>ล้างการค้นหา</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={confirm}>
                    <Text style={styles.buttonText}>ค้นหา</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
    contentContainer: {
        flex: 1, // ทำให้ส่วนนี้ขยายเต็มที่เหลือพื้นที่
    },
    listContent: {
        flexGrow: 1, // ให้ FlatList ขยายตามเนื้อหา
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    itemNameContainer: {
        flexDirection: "row",
        gap: 10,
    },
    itemText: {
        fontSize: 16,
        color: "#334155",
    },
    buttonContainer: {
        padding: 16,
        flexDirection: "row",
        gap: 10,
    },
    button: {
        backgroundColor: "#3B82F6",
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        flex: 1,
    },
    buttonText: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
        color: "white",
    },
});
