import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useTheme } from "../../theme/ThemeContext";

const links: { path: string; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { path: "/admin/overview", label: "Overview", icon: "show-chart" },
  { path: "/admin/users", label: "Users", icon: "people" },
  { path: "/admin/jobs", label: "Jobs", icon: "work" },
  { path: "/admin/groups", label: "Communities", icon: "layers" },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { colors, isDark, toggleTheme, mode } = useTheme();

  return (
    <View style={[styles.side, { backgroundColor: isDark ? "#141419" : "#FFFFFF", borderRightColor: isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB" }]}>
      <Text style={[styles.logo, { color: colors.purple }]}>Rabta Admin</Text>
      <View style={{ flex: 1, marginTop: 24, gap: 8 }}>
        {links.map((l) => {
          const active = pathname === l.path;
          return (
            <Pressable
              key={l.path}
              onPress={() => router.push(l.path as any)}
              style={[styles.link, active && { backgroundColor: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)" }]}
            >
              <MaterialIcons name={l.icon} size={22} color={active ? colors.purple : isDark ? "#9CA3AF" : "#4B5563"} />
              <Text style={{ color: active ? colors.purple : isDark ? "#E5E7EB" : "#111827", fontWeight: active ? "700" : "500" }}>{l.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.foot, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB" }]}>
        <Pressable style={styles.footBtn} onPress={toggleTheme}>
          <MaterialIcons name={mode === "dark" ? "light-mode" : "dark-mode"} size={20} color="#9CA3AF" />
          <Text style={{ color: "#9CA3AF" }}>{mode === "dark" ? "Light Mode" : "Dark Mode"}</Text>
        </Pressable>
        <Pressable style={styles.footBtn} onPress={() => router.replace("/chats")}>
          <MaterialIcons name="home" size={20} color="#9CA3AF" />
          <Text style={{ color: "#9CA3AF" }}>Return to App</Text>
        </Pressable>
        <Pressable
          style={styles.footBtn}
          onPress={() => {
            dispatch(logout());
            router.replace("/login");
          }}
        >
          <MaterialIcons name="logout" size={20} color="#F87171" />
          <Text style={{ color: "#F87171" }}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  side: { width: 256, borderRightWidth: 1, padding: 24, minHeight: "100%" },
  logo: { fontSize: 22, fontWeight: "900" },
  link: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  foot: { borderTopWidth: 1, paddingTop: 16, gap: 8 },
  footBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
});
