import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Linking,
    ScrollView,
    RefreshControl,
    Modal,
    TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, FontAwesome, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import DropDownPicker from "react-native-dropdown-picker";

export default function ActivityDetail() {
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [activity, setActivity] = useState(null);
    const [registed, setRegisted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [showReviewBtn, setShowReviewBtn] = useState(true);

    const formatDateTime = (data) => {
        if (!data) return ""; // ตรวจสอบว่ามีข้อมูลก่อน
        const firebaseTimestamp = new firestore.Timestamp(
            data.seconds,
            data.nanoseconds
        );
        const datetime = firebaseTimestamp.toDate();

        const formattedStartDate = datetime.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return formattedStartDate;
    };

    const getActivityData = () => {
        firestore()
            .collection("activities")
            .doc(params.id)
            .onSnapshot(async (snapshot) => {
                if (!snapshot.exists) return; // ถ้าไม่มีข้อมูลให้หยุดการทำงาน

                const activityData = snapshot.data();

                const fetchOwner = await firestore()
                    .collection("users")
                    .doc(activityData.createdByUserID)
                    .get();

                const ownerData = fetchOwner.data();

                const fetchRegistrations = await firestore()
                    .collection("registrations")
                    .where("activityID", "==", params.id)
                    .get();

                const RegistrationsData = [];

                for (const doc of fetchRegistrations.docs) {
                    const data = doc.data();

                    if (data.userID === user.uid) {
                        setRegisted(true);
                    } else {
                        setRegisted(false);
                    }

                    // ดึง category จาก categoryID
                    const getUserData = await firestore()
                        .collection("users")
                        .doc(data.userID)
                        .get();

                    const userData = getUserData.data();

                    RegistrationsData.push({
                        id: data.userID,
                        username: userData.username,
                        profilePicture: userData.profilePicture,
                    });
                }

                const fetchReviews = await firestore()
                    .collection("reviews")
                    .where("activityID", "==", params.id)
                    .get();

                const ReviewsData = [];

                for (const doc of fetchReviews.docs) {
                    const data = doc.data();

                    if (data.userID === user.uid) {
                        setShowReviewBtn(false);
                    }

                    ReviewsData.push({
                        id: doc.id,
                        rating: data.rating,
                        comment: data.comment,
                    });
                }

                setActivity({
                    ...activityData,
                    owner: ownerData,
                    registrations: RegistrationsData,
                    reviews: ReviewsData,
                });
            });
    };

    const cancelActivity = async () => {
        Alert.alert("", "ยืนยันยกเลิกกิจกรรม", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    firestore()
                        .collection("activities")
                        .doc(params.id)
                        .update({ status: "cancel" })
                        .then(() => {
                            if (user.role === "admin") {
                                getActivityData();
                            } else {
                                router.replace("/(tabs)/home");
                            }
                        })
                        .catch((error) => {
                            console.error("Error update cancel status:", error);
                            Alert.alert(
                                "เกิดข้อผิดพลาด",
                                "ไม่สามารถยกเลิกกิจกรรมได้ กรุณาลองใหม่อีกครั้ง"
                            );
                        }),
            },
        ]);
    };

    const endActivity = async () => {
        Alert.alert("", "ยืนยันสิ้นสุดกิจกรรม", [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    firestore()
                        .collection("activities")
                        .doc(params.id)
                        .update({ status: "success" })
                        .then(() => {
                            getActivityData();
                        })
                        .catch((error) => {
                            console.error("Error update cancel status:", error);
                            Alert.alert(
                                "เกิดข้อผิดพลาด",
                                "ไม่สามารถสิ้นสุดกิจกรรมได้ กรุณาลองใหม่อีกครั้ง"
                            );
                        }),
            },
        ]);
    };

    const joinActivity = () => {
        firestore()
            .collection("registrations")
            .add({
                userID: user.uid,
                activityID: params.id,
            })
            .then(() => {
                getActivityData();
            })
            .catch((error) => {
                console.error("Error saving registrations:", error);
            });
    };

    const cancelRegistered = async () => {
        try {
            const querySnapshot = await firestore()
                .collection("registrations")
                .where("userID", "==", user.uid)
                .get();

            if (querySnapshot.empty) {
                console.log("ไม่พบข้อมูล");
                return;
            }

            const batch = firestore().batch();
            querySnapshot.forEach((documentSnapshot) => {
                batch.delete(documentSnapshot.ref);
            });

            await batch.commit();
            setRegisted(false);
            getActivityData();
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        }
    };

    const confirmReviews = () => {
        if (comment && rating) {
            firestore()
            .collection("reviews")
            .add({
                userID: user.uid,
                rating: rating,
                comment: comment,
                activityID: params.id, 
            })
            .then(() => {
                setShowModal(false);
                getActivityData();
            })
        } else {
            Alert.alert("ผิดพลาด", "กรอกข้อมูลให้ครบถ้วน", [
                {
                    text: "ตกลง",
                }
            ]);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getActivityData();
        setRefreshing(false);
    };

    useEffect(() => {
        getActivityData();
    }, []);

    if (!user) {
        return null; // หยุดการเรนเดอร์เมื่อ user เป็น null
    }

    if (!activity) {
        // แสดง Loading เมื่อ activity ยังไม่มีข้อมูล
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                }}
            >
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ color: "#6B7280", marginTop: 16 }}>
                    กำลังโหลดข้อมูล...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.contentContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateTimeText}>
                                {formatDateTime(activity.startDate)} -{" "}
                                {formatDateTime(activity.endDate)}
                            </Text>
                            <View style={styles.participantContainer}>
                                <AntDesign
                                    name="user"
                                    color="black"
                                    size={14}
                                />
                                <Text style={styles.participantText}>
                                    {activity.registrations.length}/
                                    {activity.max}
                                </Text>
                            </View>
                        </View>

                        {/* รูปภาพ */}
                        {activity.image && (
                            <Image
                                source={{ uri: activity.image }}
                                style={styles.image}
                            />
                        )}

                        {/* สถานที่ */}
                        <View
                            style={[
                                styles.locationContainer,
                                !activity.image ? { marginTop: 15 } : "",
                            ]}
                        >
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color="black"
                            />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.locationName}>
                                    {activity.locationName}
                                </Text>
                                <Text style={styles.locationAddress}>
                                    {activity.subDistrict} {activity.district}{" "}
                                    {activity.provice}
                                </Text>
                                {/* ปุ่มเปิดแผนที่ */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitund},${activity.longitund}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Text style={styles.buttonMap}>
                                        เปิดแผนที่
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* รายละเอียด */}
                        <Text style={styles.descriptionText}>
                            {activity.description}
                        </Text>

                        {/* ผู้จัดกิจกรรม */}
                        <View style={styles.ownerContainer}>
                            <Image
                                source={{ uri: activity.owner.profilePicture }}
                                style={styles.ownerImage}
                            />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.ownerName}>
                                    {activity.owner.username}
                                </Text>
                            </View>
                        </View>

                        {/* ผู้เข้าร่วม */}
                        {activity.registrations.length > 0 && (
                            <View>
                                <Text style={styles.registeredHeader}>
                                    ผู้เข้าร่วม
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {activity.registrations.map((item) => (
                                        <View key={item.id} style={{ width: "50%" }}>
                                            <View style={styles.registeredItem}>
                                                <Image
                                                    source={{ uri: item.profilePicture }}
                                                    style={styles.registeredImage}
                                                />
                                                <Text style={styles.registeredName} numberOfLines={1}>
                                                    {item.username}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* ความคิดเห็นและคะแนน */}
                        {activity.reviews.length > 0 && (
                            <View>
                                <Text style={styles.reviewsHeader}>
                                    ความคิดเห็น
                                </Text>
                                {activity.reviews.map((item) => (
                                    <View key={item.id}>
                                        <View style={styles.reviewsItem}>
                                            <View style={styles.reviewsRating}>
                                                <FontAwesome
                                                    name="star"
                                                    size={16}
                                                    color="#FFD700"
                                                />
                                                <Text style={styles.ratingText}>
                                                    {item.rating}
                                                </Text>
                                            </View>
                                            <Text style={styles.commentText}>
                                                {item.comment}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ปุ่ม */}
                    {user.role === "admin" && (
                        <View style={{ marginBottom: 10, marginTop: 50 }}>
                            {activity.status === "ongoing" ? (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={cancelActivity}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.buttonText}>
                                        ยกเลิกกิจกรรม
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                // ข้อความยกเลิกกิจกรรม
                                <Text style={styles.cancelText}>
                                    กิจกรรมถูกยกเลิก
                                </Text>
                            )}
                        </View>
                    )}
                    {user.role !== "admin" && (
                        <>
                            {activity.status === "ongoing" ? (
                                <View style={{ marginBottom: 10, marginTop: 50 }}>
                                    {activity.createdByUserID === user.uid ? (
                                        <View>
                                            <View style={styles.chatButtonContainer}>
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={styles.chatButton}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "chat",
                                                            params: {
                                                                activityID:
                                                                    params.id,
                                                            },
                                                        })
                                                    }
                                                >
                                                    <MaterialIcons
                                                        name="chat-bubble-outline"
                                                        color="white"
                                                        size={24}
                                                    />
                                                    <Text style={styles.chatButtonText}>
                                                        สนทนา
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={styles.endActivityButton}
                                                onPress={endActivity}
                                            >
                                                <Text style={styles.buttonText}>
                                                    สิ้นสุดกิจกรรม
                                                </Text>
                                            </TouchableOpacity>
                                            <View style={styles.editCancelButtonContainer}>
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "editActivity",
                                                            params: {
                                                                id: params.id,
                                                            },
                                                        })
                                                    }
                                                    style={styles.editButton}
                                                >
                                                    <Text style={styles.buttonText}>
                                                        แก้ไข
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    onPress={cancelActivity}
                                                    style={styles.cancelButton}
                                                >
                                                    <Text style={styles.buttonText}>
                                                        ยกเลิกกิจกรรม
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View>
                                            {/* ยังไม่ได้เข้าร่วม */}
                                            {!registed ? (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={styles.joinButton}
                                                >
                                                    <Text
                                                        style={styles.joinButtonText}
                                                        onPress={joinActivity}
                                                    >
                                                        เข้าร่วมกิจกรรม
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                // หลังจากเข้าร่วม
                                                <View>
                                                    <View style={styles.chatButtonContainer}>
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={styles.chatButton}
                                                            onPress={() =>
                                                                router.push({
                                                                    pathname: "chat",
                                                                    params: {
                                                                        activityID: params.id,
                                                                    },
                                                                })
                                                            }
                                                        >
                                                            <MaterialIcons name="chat-bubble-outline" color="white" size={24} />
                                                            <Text style={styles.chatButtonText}>
                                                                สนทนา
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        style={styles.unRegisterButton}
                                                        onPress={cancelRegistered}
                                                    >
                                                        <Text style={styles.unRegisterText}>
                                                            ยกเลิกการเข้าร่วม
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <>
                                   {activity.status === "success" ? (
                                        <View>
                                            {activity.createdByUserID !== user.uid && (
                                                <>
                                                    {showReviewBtn && (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={styles.reviewButton}
                                                            onPress={() => setShowModal(true)}
                                                        >
                                                            <Text style={styles.reviewText}>
                                                                แสดงความคิดเห็นและให้คะแนน
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </>
                                            )}
                                            <Text style={styles.endText}>
                                                สิ้นสุดกิจกรรม
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.cancelText}>
                                            กิจกรรมถูกยกเลิก
                                        </Text>
                                    )}
                                    
                                </>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Modal แสดงความคิดเห็นและคะแนน */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowModal(!showModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>แสดงความคิดเห็นและให้คะแนน</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        {/* Dropdown จำนวนวัน */}
                        <View style={styles.modalInputContainer}>
                            <MaterialIcons
                                name="star-border"
                                size={24}
                                color="#A6A6A6"
                            />
                            <DropDownPicker
                                open={openDropdown}
                                value={rating}
                                items={[
                                    {
                                        label: "1",
                                        value: 1,
                                    },
                                    {
                                        label: "2",
                                        value: 2,
                                    },
                                    {
                                        label: "3",
                                        value: 3,
                                    },
                                    {
                                        label: "4",
                                        value: 4,
                                    },
                                ]}
                                setOpen={setOpenDropdown}
                                setValue={setRating}
                                placeholder="คะแนน"
                                style={{
                                    backgroundColor: "#FFF5F5",
                                    borderWidth: 0,
                                    flex: 1,
                                    width: "95%",
                                }}
                                dropDownContainerStyle={{
                                    backgroundColor: "#FFF5F5",
                                    width: "95%",
                                }}
                                placeholderStyle={{
                                    fontFamily: "Kanit_400Regular",
                                    fontSize: 16,
                                    color: "#A6A6A6",
                                }}
                                labelStyle={{
                                    fontFamily: "Kanit_400Regular",
                                    fontSize: 16,
                                    color: "black",
                                }}
                            />
                        </View>
                        <View style={styles.modalInputContainer}>
                            <MaterialCommunityIcons
                                name="message-star-outline"
                                size={24}
                                color="#A6A6A6"
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="ความคิดเห็น"
                                placeholderTextColor="#A6A6A6"
                                value={comment}
                                onChangeText={setComment}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.modalBtn}
                                onPress={confirmReviews}
                            >
                                <Text style={styles.modalBtnText}>ยืนยัน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    activityName: {
        fontSize: 24,
        fontFamily: "Kanit_600SemiBold",
        color: "black",
    },
    dateTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    dateTimeText: {
        color: "#6B7280",
        fontFamily: "Kanit_400Regular",
    },
    participantContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    participantText: {
        color: "#6B7280",
        marginLeft: 4,
        fontFamily: "Kanit_400Regular",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationName: {
        fontFamily: "Kanit_600SemiBold",
        color: "black",
    },
    locationAddress: {
        color: "#6B7280",
        fontFamily: "Kanit_400Regular",
    },
    descriptionText: {
        color: "#374151",
        marginTop: 16,
        fontFamily: "Kanit_400Regular",
        fontSize: 18,
    },
    registeredHeader: {
        color: "#374151",
        marginTop: 25,
        marginBottom: 6,
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
    },
    reviewsHeader: {
        color: "#374151",
        marginTop: 25,
        marginBottom: 6,
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
    },
    ownerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    ownerImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    ownerName: {
        color: "black",
        fontFamily: "Kanit_400Regular",
    },
    ratingText: {
        color: "#374151",
        marginLeft: 4,
        fontFamily: "Kanit_400Regular",
    },
    commentText: {
        color: "#374151",
        marginLeft: 4,
        fontFamily: "Kanit_400Regular",
    },
    joinButton: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#FE805C",
        borderRadius: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    joinButtonText: {
        marginLeft: 8,
        color: "white",
        fontSize: 16,
        fontFamily: "Kanit_700Bold",
    },
    chatButtonContainer: {
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#9CA3AF",
    },
    chatButton: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#3B82F6",
        borderRadius: 20,
        paddingVertical: 12,
    },
    chatButtonText: {
        marginLeft: 8,
        color: "white",
        fontSize: 16,
        fontFamily: "Kanit_700Bold",
    },
    endActivityButton: {
        backgroundColor: "#F59E0B",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
    },
    editCancelButtonContainer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        backgroundColor: "#3B82F6",
    },
    cancelButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        backgroundColor: "#EF4444",
    },
    buttonText: {
        textAlign: "center",
        color: "white",
        fontSize: 14,
        fontFamily: "Kanit_700Bold",
    },
    buttonMap: {
        color: "blue",
        fontFamily: "Kanit_400Regular",
    },
    cancelText: {
        color: "#EF4444",
        fontFamily: "Kanit_600SemiBold",
        fontSize: 24,
        marginHorizontal: "auto",
        paddingBottom: 15,
        marginTop: 15,
    },
    endText: {
        color: "#07A424",
        fontFamily: "Kanit_600SemiBold",
        fontSize: 24,
        marginHorizontal: "auto",
        paddingBottom: 15,
        marginTop: 15,
    },
    registeredItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    reviewsItem: {
        paddingVertical: 2,
    },
    reviewsRating: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    registeredImage: {
        width: 35,
        height: 35,
        borderRadius: 25,
    },
    registeredName: {
        fontSize: 14,
        marginLeft: 5,
    },
    unRegisterButton: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#EF4444",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
    },
    unRegisterText: {
        color: "white",
        fontSize: 16,
        fontFamily: "Kanit_700Bold",
    },
    reviewButton: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#FFEA00",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
    },
    reviewText: {
        color: "black",
        fontSize: 16,
        fontFamily: "Kanit_700Bold",
    },
    image: {
        width: "100%",
        height: 350,
        marginHorizontal: "auto",
        marginVertical: 20,
        borderRadius: 15,
        elevation: 7,
        objectFit: "cover",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        elevation: 5,
        padding: 14,
        width: "80%",
        minHeight: 85,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    modalHeader: {
        fontFamily: "Kanit_600SemiBold",
        fontSize: 16,
        marginBottom: 10,
    },
    modalCloseIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    modalFooter: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 14,
    },
    modalBtn: {
        marginBottom: 2,
        backgroundColor: "#5476FF",
        width: 62,
        height: 35,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    modalBtnText: {
        color: "white",
        fontFamily: "Kanit_600SemiBold",
    },
    modalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        marginBottom: 5,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 10,
        width: "100%",
    },
    modalInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
});
