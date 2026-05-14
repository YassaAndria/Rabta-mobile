/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import axiosInstance from "../../src/api/axiosInstance";
import { useTheme } from "../../src/theme/ThemeContext";
import { typography } from "../../src/theme/typography";

export default function ChatsScreen() {
  const { colors, isDark } = useTheme();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/chats");
        setChats(res.data.data.chats || []);
      } catch (e: any) {
        setError(e.response?.data?.message || "Failed to load chats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={[typography.body, { color: colors.textMuted, marginTop: 12 }]}>Loading chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, padding: 24 }]}>
        <MaterialIcons name="error-outline" size={40} color={colors.errorText} />
        <Text style={[typography.body, { color: colors.errorText, textAlign: "center", marginTop: 8 }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.text }]}>Chats</Text>
        <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{chats.length} conversations</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textMuted, textAlign: "center", marginTop: 48 }]}>No chats yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.purple10 }]}>
              <MaterialIcons name="chat-bubble" size={22} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.text, fontWeight: "700" }]} numberOfLines={1}>
                {item.isGroup ? item.groupName || "Group" : "Direct chat"}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={1}>
                {item.latestMessage?.content || "No messages yet"}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
