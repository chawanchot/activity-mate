import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext"

export default function EditActivity() {
    const dbActivities = firestore().collection("activities");
    const dbCategory = firestore().collection("category");
    const params = useLocalSearchParams(); 
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // วันที่/เวลา เริ่มกิจกรรม
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);

    // วันที่/เวลา สิ้นสุดกิจกรรม
    const [endDate, setEndDate] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [name, setName] = useState(""); // ชื่อกิจกรรม
    const [description, setDescription] = useState(""); // รายละเอียดกิจกรรม
    const [max, setMax] = useState(0); // จำนวนคนเข้าร่วม
    const [place, setPlace] = useState(null); // ข้อมูลสถานที่
    const [selectedCategory, setSelectedCategory] = useState(); // หมวดหมู่ที่เลือก

    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const submit = async () => {
        if (name && description && max > 0 && place && selectedCategory) {

            const combinedStartDateTime = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
                startTime.getHours(),
                startTime.getMinutes()
            );

            const combinedEndDateTime = new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate(),
                endTime.getHours(),
                endTime.getMinutes()
            );

            // แปลงเป็น Firestore Timestamp
            const startTimestamp = firestore.Timestamp.fromDate(combinedStartDateTime);
            const endTimestamp = firestore.Timestamp.fromDate(combinedEndDateTime);

            try {
                await firestore()
                    .collection("activities")
                    .doc(params.editId || params.id)
                    .update({
                        categoryID: selectedCategory,
                        name: name,
                        description: description,
                        max: max,
                        locationName: place.name,
                        subDistrict: place.subdistrict,
                        district: place.district,
                        provice: place.provice,
                        latitund: place.location.lat,
                        longitund: place.location.lng,
                        startDate: startTimestamp,
                        endDate: endTimestamp
                    });

                console.log(`Document ${params.editId || params.id} updated`);

                router.replace("/(tabs)/home")

                setName("");
                setDescription("");
                setMax(0);
                setPlace(null);
                setSelectedCategory("");
            } catch (error) {
                console.error("Error update document:", error);
            }
        } else {
            Alert.alert("", "ข้อมูลไม่ครบถ้วน");
        }
    }

    const convertDateTime = (data) => {
        const firebaseTimestamp = new firestore.Timestamp(data.seconds, data.nanoseconds);
        const datetime = firebaseTimestamp.toDate();

        return datetime;
    }

    useEffect(() => {
        const getCategory = async () => {
            try {
                const fetchCategory = await firestore()
                    .collection("category")
                    .get();
        
                const dataCategory = [];

                for (const doc of fetchCategory.docs) {
                    const data = doc.data();

                    dataCategory.push({
                        id: doc.id,
                        ...data
                    });
                }
        
                setCategories(dataCategory);
            } catch (error) {
                console.log("fetch category error: ", error);
            }
        }

        const getActivityData = async () => {
            setLoading(true);
            try {
                const fetchActivity = await firestore()
                    .collection("activities")
                    .doc(params.id)
                    .get();

                const activityData = fetchActivity.data();

                if (activityData) {
                    setName(activityData.name);
                    setDescription(activityData.description);
                    setMax(activityData.max.toString());
                    setSelectedCategory(activityData.categoryID);
                    setPlace({
                        name: activityData.locationName,
                        subdistrict: activityData.subDistrict,
                        district: activityData.district,
                        provice: activityData.provice,
                        location: {
                            lat: activityData.latitund,
                            lng: activityData.longitund
                        },
                    })
                    setStartDate(convertDateTime(activityData.startDate));
                    setStartTime(convertDateTime(activityData.startDate));
                    setEndDate(convertDateTime(activityData.endDate));
                    setEndTime(convertDateTime(activityData.endDate));
                }
            } catch (error) {
                console.log("fetch activity data error: ", error);
            }

            setLoading(false);
        };

        getCategory();
        getActivityData();
    }, []);

    useEffect(() => {
        // ตรวจสอบว่ามีค่า params.place หรือ params.form
        if (params.place) {
            const placeData = JSON.parse(params.place); // แปลงกลับเป็น Object
            setPlace(placeData);
        }
        if (params.form) {
            const formData = JSON.parse(params.form); // แปลงกลับเป็น Object

            setName(formData.name)
            setDescription(formData.description)
            setStartDate(new Date(formData.startDate));
            setStartTime(new Date(formData.startTime));
            setEndDate(new Date(formData.endDate));
            setEndTime(new Date(formData.endTime));
            setMax(formData.max);
            setSelectedCategory(formData.selectedCategory);
        }
    }, [params.place, params.form]);    

    if (loading) {
        // แสดง Loading เมื่อกำลังโหลดข้อมูล
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} key={params.id}>
            <View>
                {/* Form */}
                <View style={{ paddingHorizontal: 18 }}>
                    {/* ชื่อกิจกรรม */}
                    <Text style={styles.label}>ชื่อกิจกรรม</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="pen" size={16} color="#A6A6A6" />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* รายละเอียด */}
                    <Text style={styles.label}>รายละเอียด</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome5
                            name="align-left"
                            size={16}
                            color="#A6A6A6"
                        />
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* วันที่เริ่มต้น / เวลาที่เริ่มต้น */}
                    <Text style={styles.label}>วันที่/เวลา เริ่มกิจกรรม</Text>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTimeInput}>
                            <FontAwesome5 name="calendar" size={16} color="#D675A7" />
                            <TouchableOpacity
                                onPress={() => setShowStartDatePicker(true)}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                <Text style={styles.dateTimeText}>
                                    {startDate.toLocaleDateString("th-TH")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                onChange={(event, selected) => {
                                    setShowStartDatePicker(false);
                                    if (selected) {
                                        setStartDate(selected);
                                    }
                                }}
                            />
                        )}
                        <View style={styles.dateTimeInput}>
                            <FontAwesome5 name="clock" size={16} color="#D675A7" />
                            <TouchableOpacity
                                onPress={() => setShowStartTimePicker(true)}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                <Text style={styles.dateTimeText}>
                                    {startTime.toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                onChange={(event, selected) => {
                                    setShowStartTimePicker(false);
                                    if (selected) {
                                        setStartTime(selected);
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* วันที่สิ้นสุด / เวลาสิ้นสุด */}
                    <Text style={styles.label}>วันที่/เวลา สิ้นสุดกิจกรรม</Text>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTimeInput}>
                            <FontAwesome5 name="calendar" size={16} color="#D675A7" />
                            <TouchableOpacity
                                onPress={() => setShowEndDatePicker(true)}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                <Text style={styles.dateTimeText}>
                                    {endDate.toLocaleDateString("th-TH")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(event, selected) => {
                                    setShowEndDatePicker(false);
                                    if (selected) {
                                        setEndDate(selected);
                                    }
                                }}
                            />
                        )}
                        <View style={styles.dateTimeInput}>
                            <FontAwesome5 name="clock" size={16} color="#D675A7" />
                            <TouchableOpacity
                                onPress={() => setShowEndTimePicker(true)}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                <Text style={styles.dateTimeText}>
                                    {endTime.toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                onChange={(event, selected) => {
                                    setShowEndTimePicker(false);
                                    if (selected) {
                                        setEndTime(selected);
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* จำนวนเข้าร่วมสูงสุด */}
                    <Text style={styles.label}>จำนวนเข้าร่วมสูงสุด</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="users" size={16} color="#A6A6A6" />
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={max}
                            onChangeText={setMax}
                        />
                    </View>

                    {/* สถานที่ */}
                    <Text style={styles.label}>สถานที่จัดกิจกรรม</Text>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: "/searchLocation",
                            params: {
                                id: params.id,
                                name,
                                description,
                                startDate,
                                startTime,
                                endDate,
                                endTime,
                                max,
                                selectedCategory,
                                backRoute: "/editActivity",
                            }
                        })}
                        style={styles.inputContainer}
                    >
                        <FontAwesome5 name="map-marker-alt" size={16} color="#A6A6A6" />
                        <Text className="flex-1 ml-2 text-xl font-kanit">
                            {place ? place.name : ""}
                        </Text>
                    </TouchableOpacity>

                    {/* หมวดหมู่กิจกรรม */}
                    <Text style={styles.label}>หมวดหมู่กิจกรรม</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="layer-group" size={16} color="#A6A6A6" />
                        <DropDownPicker
                            open={open}
                            value={selectedCategory}
                            items={categories.map((category) => ({
                                label: category.name,
                                value: category.id,
                            }))}
                            setOpen={setOpen}
                            setValue={setSelectedCategory}
                            dropDownDirection="TOP" 
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

                {/* Button */}
                <View style={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity onPress={submit} style={styles.button}>
                        <Text style={styles.buttonText}>
                            แก้ไข
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
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
        fontSize: 18,
        fontFamily: "Kanit_400Regular",
    },
    dateTimeContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    dateTimeInput: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        borderRadius: 10,
        height: 55,
        paddingHorizontal: 10,
    },
    dateTimeText: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily: "Kanit_400Regular",
    },
    button: {
        marginTop: 10,
        backgroundColor: "#fb923c",
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20
    },
    buttonText: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 18,
        color: "white"
    }
})
