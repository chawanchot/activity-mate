import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function category() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category Page</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontFamily: "Kanit_600SemiBold"
    }
})