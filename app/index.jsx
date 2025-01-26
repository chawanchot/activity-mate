import {
    Text,
    SafeAreaView,
} from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    const { isLoading, loggedIn } = useAuth()

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!loggedIn) {
        return (
            <Redirect href="/login" />
        );
    }

    return (
        <Redirect href="/(admin)/home" />
    )
};