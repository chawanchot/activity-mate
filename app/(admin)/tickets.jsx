import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

export default function Tickets() {
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [ticketsData, setTicketsData] = useState([]);

    const formatDateTime = (data) => {
        const datetime = data.toDate();
        const formatted = datetime.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return formatted;
    };

    const geTickets = async () => {
        try {
            const getData = await firestore()
                .collection("supportTickets")
                .orderBy("createdAt", "desc")
                .get();

            const data = await Promise.all(
                getData.docs.map(async (doc) => {
                    let ticketData = doc.data();

                    const userSnapshot = await firestore()
                        .collection("users")
                        .doc(ticketData.userID)
                        .get();

                    const username = userSnapshot.data().username;

                    return {
                        id: doc.id,
                        username: username,
                        title: ticketData.title,
                        createdAt: formatDateTime(ticketData.createdAt),
                    };
                })
            );

            setTicketsData(data);
        } catch (error) {
            console.log("fetch Data error: ", error);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        geTickets();
        setRefreshing(false);
    };

    useEffect(() => {
        geTickets();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* แสดงรายการ */}
            <FlatList
                data={ticketsData}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 3 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() =>
                            router.push({
                                pathname: "(admin)/chatTicket",
                                params: {
                                    ticketID: item.id,
                                    title: item.title,
                                    createdAt: item.createdAt,
                                    username: item.username
                                },
                            })
                        } 
                        style={styles.listContainer}
                    >
                        <View style={styles.listContent}>
                            <Text style={styles.dateText}>{item.createdAt}</Text>

                            {/* ผู้ติดต่อ */}
                            <View>
                                <Text style={styles.headerText}>
                                    ผู้ติดต่อ
                                </Text>
                                <Text style={styles.name}>{item.username}</Text>
                            </View>
                            
                            {/* ชื่อเรื่อง */}
                            <View>
                                <Text style={styles.headerText}>
                                    เรื่อง
                                </Text>
                                <Text style={styles.title}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 6,
    },
    listContainer: {
        backgroundColor: "white",
        padding: 3,
        borderRadius: 10,
        elevation: 5,
        marginBottom: 6
    },
    listContent: {
        flexDirection: "column",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    headerText: {
        fontSize: 16,
        fontFamily: "Kanit_600SemiBold",
    },
    contentContainer: {
        paddingVertical: 10,
    },
    title: {
        fontSize: 14,
        fontFamily: "Kanit_400Regular",
    },
    name: {
        fontSize: 16,
        fontFamily: "Kanit_400Regular",
    },
    dateText: {
        fontSize: 12,
        fontFamily: "Kanit_400Regular",
        position: "absolute",
        right: 15,
        top: 5,
    },
});
