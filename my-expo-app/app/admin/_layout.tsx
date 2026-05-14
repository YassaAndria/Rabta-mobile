import { Redirect, Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { AdminSidebar } from "../../src/components/layout/AdminSidebar";
import type { RootState } from "../../src/store/store";

export default function AdminLayout() {
  const { user, token } = useSelector((s: RootState) => s.auth);

  if (!token || !user) {
    return <Redirect href="/login" />;
  }
  if (user.role !== "admin") {
    return <Redirect href="/chats" />;
  }

  return (
    <View style={styles.root}>
      <AdminSidebar />
      <View style={styles.main}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: "#F9FAFB" },
  main: { flex: 1 },
});
