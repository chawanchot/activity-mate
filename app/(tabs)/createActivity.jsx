import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Alert,
    Image,
    ScrollView
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../contexts/AuthContext"
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";

export default function MemberCreateActivity() {
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
    const [max, setMax] = useState(""); // จำนวนคนเข้าร่วม
    const [place, setPlace] = useState(null); // ข้อมูลสถานที่
    const [selectedCategory, setSelectedCategory] = useState(); // หมวดหมู่ที่เลือก
    const [activityImage, setActivityImage] = useState("") // รูปภาพ

    const [creating, setCreating] = useState(false);
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    // เลือกรูปภาพจากอุปกรณ์
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.5, // ความคมชัด
            });

        if (!result.canceled) {
            setActivityImage(result.assets[0].uri);
        }
    };

    // อัปโหลดรูปภาพไปยัง Firebase Cloud Storage
    const uploadImage = async (uri) => {
        const filename = uri.substring(uri.lastIndexOf("/") + 1);
        const reference = storage().ref(`activity/${filename}`);
        
        await reference.putFile(uri);
        const url = await reference.getDownloadURL();

        return url;
    };

    // บันทึกข้อมูลสร้างกิจกรรม
    const submit = async () => {
        if (name && description && max > 0 && place && selectedCategory) {
            try {
                setCreating(true);

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

                let imageUrl = "";

                if (activityImage) {
                    imageUrl = await uploadImage(activityImage);
                }
    
                firestore().collection("activities").add({
                    categoryID: selectedCategory,
                    createdByUserID: user.uid,
                    name: name,
                    description: description,
                    max: parseInt(max),
                    locationName: place.name,
                    subDistrict: place.subdistrict,
                    district: place.district,
                    provice: place.provice,
                    latitund: place.location.lat,
                    longitund: place.location.lng,
                    startDate: startTimestamp,
                    endDate: endTimestamp,
                    status: "ongoing",
                    image: imageUrl
                })
                
                console.log("Activity saved successfully!");
                router.replace("/(tabs)/home")
    
                setName("");
                setDescription("");
                setMax("");
                setPlace(null);
                setSelectedCategory("");
                setActivityImage("");

                setCreating(false);
            } catch (error) {
                console.error("Error saving activity:", error);
            }
        } else {
            Alert.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบถ้วน", [{ text: "ตกลง" }]);
        }
    }

    useEffect(() => {
        const getCategory = firestore()
            .collection("category")
            .where("status", "!=", false)
            .onSnapshot(
                (snapshot) => {
                    const dataCategory = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // เรียงตามตัวอักษร
                    dataCategory.sort((a, b) => a.name.localeCompare(b.name));
                    
                    setCategories(dataCategory);
                },
                (error) => {
                    console.error("Error fetching category: ", error);
                }
            )

        // หยุดการติดตามข้อมูลใน firestore
        return () => getCategory();
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
            setActivityImage(formData.activityImage);
        }
    }, [params.place, params.form]);    

    return (
        <SafeAreaView style={styles.container} key={params.id}>
            <ScrollView style={{ flex: 1, marginVertical: 10 }}>
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
                            <FontAwesome5 name="align-left" size={16} color="#A6A6A6" />
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
                                    is24Hour={true}
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
                                    is24Hour={true}
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
                                    name,
                                    description,
                                    startDate,
                                    startTime,
                                    endDate,
                                    endTime,
                                    max,
                                    selectedCategory,
                                    activityImage: encodeURIComponent(activityImage),
                                    backRoute: "/(tabs)/createActivity"
                                }
                            })}
                            style={styles.inputContainer}
                        >
                            <FontAwesome5 name="map-marker-alt" size={16} color="#A6A6A6" />
                            <Text style={styles.input}>
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
                                items={categories
                                    .filter((category) => category.status === true) // กรองเฉพาะ category ที่ status เป็น true
                                    .map((category) => ({
                                        label: category.name,
                                        value: category.id,
                                    }))}                        
                                setOpen={setOpen}
                                setValue={setSelectedCategory}
                                dropDownDirection="BOTTOM" 
                                listMode="SCROLLVIEW"
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

                        {/* รูปภาพ */}
                        <TouchableOpacity activeOpacity={0.8} onPress={pickImage}>
                            <Text style={styles.uploadImageText}>แตะเพื่อเลือกรูปภาพ</Text>
                            <Image 
                                source={{ uri: activityImage !== "" ? activityImage : "https://www.state.co.th/wp-content/uploads/2022/02/placeholder-1.png" }}
                                style={styles.img}
                            />
                        </TouchableOpacity>
                        {activityImage && (
                            <TouchableOpacity 
                                activeOpacity={0.8} 
                                style={{ margin: "auto", marginBottom: 10 }}
                                onPress={() => setActivityImage("")}
                            >
                                <MaterialCommunityIcons name="file-image-remove" size={25} color="red" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Button */}
                    <View style={{ paddingHorizontal: 16 }}>
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={submit}
                            disabled={creating}
                        >
                            <Text style={styles.buttonText}>
                                {creating ? "กำลังสร้าง..." : "สร้าง"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    img: {
        width: 180,
        height: 180,
        borderRadius: 15,
        margin: "auto",
        marginBottom: 10
    },
    uploadImageText: {
        textAlign: "center",
        color: "#666",
        marginTop: 10,
        marginBottom: 5,
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
