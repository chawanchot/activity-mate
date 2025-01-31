import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../contexts/AuthContext"

export default function MemberCreateActivity() {
    const dbActivities = firestore().collection("activities");
    const dbCategory = firestore().collection("category");
    const params = useLocalSearchParams(); 
    const { user } = useAuth()

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

    const getCategoryData = (querySnapShot) => {
        const Arr = [];
        querySnapShot.forEach((res) => {
            const { name, status } = res.data();
            Arr.push({
                id: res.id,
                name,
                status,
            });
        });

        setCategories(Arr);
    };

    const submit = () => {
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

            dbActivities.add({
                categoryID: selectedCategory,
                createdByUserID: user.uid,
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
                endDate: endTimestamp,
            })
            .then(() => {
                console.log("Activity saved successfully!");
                router.replace("/(tabs)/home")

                setName("");
                setDescription("");
                setMax(0);
                setPlace(null);
                setSelectedCategory("");
            })
            .catch((error) => {
                console.error("Error saving activity:", error);
            });

        } else {
            Alert.alert("", "ข้อมูลไม่ครบถ้วน");
        }
    }

    useEffect(() => {
        dbCategory.onSnapshot(getCategoryData);
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

    return (
        <SafeAreaView className="h-full bg-white" key={params.id}>
            <View>
                {/* Form */}
                <View className="p-5">
                    {/* ชื่อกิจกรรม */}
                    <Text className="font-kanit">ชื่อกิจกรรม</Text>
                    <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                        <FontAwesome5 name="pen" size={16} color="#A6A6A6" />
                        <TextInput
                            className="flex-1 ml-2 text-xl font-kanit"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* รายละเอียด */}
                    <Text className="font-kanit">รายละเอียด</Text>
                    <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                        <FontAwesome5
                            name="align-left"
                            size={16}
                            color="#A6A6A6"
                        />
                        <TextInput
                            className="flex-1 ml-2 text-xl font-kanit"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* วันที่เริ่มต้น / เวลาที่เริ่มต้น */}
                    <Text className="font-kanit">วันที่/เวลา เริ่มกิจกรรม</Text>
                    <View className="flex-row gap-2 mb-2">
                        <View className="flex-1 flex-row items-center bg-[#FFF5F5] rounded-xl h-16 px-2">
                            <FontAwesome5
                                name="calendar"
                                size={16}
                                color="#D675A7"
                            />
                            <TouchableOpacity
                                onPress={() => setShowStartDatePicker(true)}
                                className="flex-1 ml-2"
                            >
                                <Text className="text-xl font-kanit">
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
                        <View className="flex-1 flex-row items-center bg-[#FFF5F5] rounded-xl h-16 px-2">
                            <FontAwesome5
                                name="clock"
                                size={16}
                                color="#D675A7"
                            />
                            <TouchableOpacity
                                onPress={() => setShowStartTimePicker(true)}
                                className="flex-1 ml-2"
                            >
                                <Text className="text-xl font-kanit">
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
                    <Text className="font-kanit">วันที่/เวลา สิ้นสุดกิจกรรม</Text>
                    <View className="flex-row gap-2 mb-2">
                        <View className="flex-1 flex-row items-center bg-[#FFF5F5] rounded-xl h-16 px-2">
                            <FontAwesome5
                                name="calendar"
                                size={16}
                                color="#D675A7"
                            />
                            <TouchableOpacity
                                onPress={() => setShowEndDatePicker(true)}
                                className="flex-1 ml-2"
                            >
                                <Text className="text-xl font-kanit">
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
                        <View className="flex-1 flex-row items-center bg-[#FFF5F5] rounded-xl h-16 px-2">
                            <FontAwesome5
                                name="clock"
                                size={16}
                                color="#D675A7"
                            />
                            <TouchableOpacity
                                onPress={() => setShowEndTimePicker(true)}
                                className="flex-1 ml-2"
                            >
                                <Text className="text-xl font-kanit">
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
                    <Text className="font-kanit">จำนวนเข้าร่วมสูงสุด</Text>
                    <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                        <FontAwesome5 name="users" size={16} color="#A6A6A6" />
                        <TextInput
                            className="flex-1 ml-2 text-xl font-kanit"
                            keyboardType="number-pad"
                            value={max}
                            onChangeText={setMax}
                        />
                    </View>

                    {/* สถานที่ */}
                    <Text className="font-kanit">สถานที่จัดกิจกรรม</Text>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: "/searchLocation",
                            params: {
                                name,
                                description,
                                startDate,
                                startTime,
                                endDate,
                                endTime,
                                max,
                                selectedCategory,
                                backRoute: "/(tabs)/createActivity"
                            }
                        })}
                        className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full"
                    >
                        <FontAwesome5
                            name="map-marker-alt"
                            size={16}
                            color="#A6A6A6"
                        />
                        <Text className="flex-1 ml-2 text-xl font-kanit">
                            {place ? place.name : ""}
                        </Text>
                    </TouchableOpacity>

                    {/* หมวดหมู่กิจกรรม */}
                    <Text className="font-kanit">หมวดหมู่กิจกรรม</Text>
                    <View className="flex-row items-center mb-2 bg-[#FFF5F5] rounded-xl h-16 px-3 w-full">
                        <FontAwesome5
                            name="layer-group"
                            size={16}
                            color="#A6A6A6"
                        />
                        <DropDownPicker
                            open={open}
                            value={selectedCategory}
                            items={categories
                                .filter((category) => category.status === true) // กรองเฉพาะ category ที่ status เป็น true
                                .map((category) => ({
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
                <View className="p-4">
                    <TouchableOpacity onPress={submit} className="bg-orange-400 rounded-full items-center py-3">
                        <Text className="text-white font-bold text-lg">
                            สร้าง
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
