import "react-native-get-random-values";
import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";

export default function SearchLocation() {
    const params = useLocalSearchParams();

    const placeSelect = (data, details) => {
        const address = details.address_components;
        const location = details.geometry.location;

        let subdistrict = "";
        let district = "";
        let provice = "";

        address.forEach((item) => {
            if (
                item.types.includes("locality") ||
                item.types.includes("sublocality_level_2")
            ) {
                subdistrict = item.long_name;
            }
            if (
                item.types.includes("administrative_area_level_2") ||
                item.types.includes("sublocality_level_1")
            ) {
                district = item.long_name;
            }
            if (item.types.includes("administrative_area_level_1")) {
                provice = item.long_name;
            }
        });

        const locationData = {
            name: details.name,
            subdistrict,
            district,
            provice,
            location,
        };

        // ส่งข้อมูลสถานที่กลับไปยังหน้าสร้างกิจกรรม
        router.push({
            pathname: params.backRoute,
            params: {
                editId: params.id || "",
                form: JSON.stringify(params), // แปลง form เป็น JSON String
                place: JSON.stringify(locationData), // แปลง place เป็น JSON String
            },
        });
    };

    console.log(params);

    return (
        <SafeAreaView className="h-full bg-white">
            <View className="h-full p-4">
                <GooglePlacesAutocomplete
                    placeholder="ค้นหาสถานที่"
                    onPress={placeSelect}
                    query={{
                        key: "AIzaSyB1xg5k07P-4AP72JiLZUaZMOSD0fEJkDo",
                        language: "th",
                        components: "country:th",
                    }}
                    fetchDetails={true}
                    styles={{
                        textInputContainer: {
                            backgroundColor: "#FFF5F5",
                            borderRadius: 10,
                            paddingHorizontal: 10,
                        },
                        textInput: {
                            height: 50,
                            fontSize: 18,
                            backgroundColor: "#FFF5F5",
                        },
                        listView: {
                            marginTop: 10,
                        },
                        separator: {
                            height: 0, // ลบเส้นคั่นระหว่างรายการ
                        },
                    }}
                    renderRow={(data) => (
                        <View>
                            <Text className="text-black text-lg font-semibold">
                                {data.structured_formatting.main_text}
                            </Text>
                            <Text className="text-black text-base">
                                {data.structured_formatting.secondary_text}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
