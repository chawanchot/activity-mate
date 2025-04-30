import "react-native-get-random-values";
import { StyleSheet, View, Text } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";

export default function SearchLocation() {
    const params = useLocalSearchParams();

    // ฟังก์ชันสำหรับเลือกสถานที่
    const placeSelect = (data, details) => {
        const address = details.address_components; // ดึงข้อมูลที่อยู่จากรายละเอียดสถานที่
        const location = details.geometry.location; // ดึงพิกัดสถานที่

        let subdistrict = "";
        let district = "";
        let provice = "";

         // แยกประเภทข้อมูลที่อยู่
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
            subdistrict: subdistrict.replaceAll(" ", ""),
            district: district.replaceAll(" ", ""),
            provice: provice.replaceAll(" ", ""),
            location,
        };

        // ส่งข้อมูลสถานที่กลับไปยังหน้าสร้างกิจกรรม
        router.push({
            pathname: params.backRoute,
            params: {
                editId: params.id || "",
                form: JSON.stringify({
                    ...params,
                    // activityImage: params.activityImage ? encodeURIComponent(params.activityImage) : "",
                    // cacheImage: params.cacheImage ? encodeURIComponent(params.cacheImage) : ""
                }),
                place: JSON.stringify(locationData),
            },
        });
        
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    placeholder="ค้นหาสถานที่"
                    onPress={placeSelect}
                    query={{
                        key: "AIzaSyB1xg5k07P-4AP72JiLZUaZMOSD0fEJkDo",
                        language: "th",
                        components: "country:th",
                    }}
                    fetchDetails={true} // ดึงรายละเอียดของสถานที่
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
                            fontFamily: "Kanit_400Regular"
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
                            <Text style={styles.placeName}>
                                {data.structured_formatting.main_text}
                            </Text>
                            <Text style={styles.placeDetail}>
                                {data.structured_formatting.secondary_text}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    searchContainer: {
        height: "100%",
        paddingHorizontal: 16,
    },
    placeName: {
        color: "black",
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold"
    },
    placeDetail: {
        color: "black",
        fontSize: 14,
        fontFamily: "Kanit_400Regular"
    }
})
