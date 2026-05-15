/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import axiosInstance from "../../src/api/axiosInstance";
import { useTheme } from "../../src/theme/ThemeContext";
import { typography } from "../../src/theme/typography";

export default function CallsScreen() {
  const { colors, isDark } = useTheme();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/calls/history");
        setCalls(res.data.data?.calls ?? []);
      } catch {
        setCalls([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.purple} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.text }]}>Calls</Text>
        <Text style={[typography.bodySmall, { color: colors.textMuted }]}>Call history</Text>
      </View>
      <FlatList
        data={calls}
        keyExtractor={(item, i) => item._id || String(i)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={[typography.body, { color: colors.textMuted, textAlign: "center", marginTop: 40 }]}>No calls yet.</Text>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <MaterialIcons name="call" size={22} color={colors.purple} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>{item.type || "call"} — {item.status}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>{item.duration != null ? `${item.duration}s` : ""}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, borderBottomWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
});
