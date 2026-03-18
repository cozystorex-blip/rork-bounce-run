import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Template</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
