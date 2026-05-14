/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePicture } from "../../src/api/auth";
import { updateProfile as patchUserApi } from "../../src/api/user";
import { updateProfile } from "../../src/store/slices/authSlice";
import type { RootState } from "../../src/store/store";
import { useTheme } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { typography } from "../../src/theme/typography";

export default function EditProfileScreen() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    jobTitle: user?.jobTitle || "",
    location: user?.location || "",
    bioHeadline: user?.bioHeadline || "",
    detailedAbout: user?.bio || user?.about || "",
    skillsText: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
  });

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: "error", text1: "Permission required" });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    try {
      setIsUploading(true);
      const name = asset.fileName || "avatar.jpg";
      const type = asset.mimeType || "image/jpeg";
      const response = await uploadProfilePicture(asset.uri, name, type);
      dispatch(updateProfile({ avatar: response.avatar }));
      Toast.show({ type: "success", text1: "Profile photo updated!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to upload image." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = () => {
    Alert.alert("Remove photo", "Are you sure you want to remove your profile photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(updateProfile({ avatar: null })) },
    ]);
  };

  const saveLocalOnly = () => {
    dispatch(updateProfile(formData));
    Toast.show({ type: "success", text1: "Profile updated (local)" });
    router.back();
  };

  const saveToServer = async () => {
    try {
      setSaving(true);
      const skills = formData.skillsText
        .split(",")
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean);
      const res = await patchUserApi({
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        location: formData.location,
        bioHeadline: formData.bioHeadline,
        about: formData.detailedAbout,
        skills,
      });
      dispatch(updateProfile(res.data.user));
      Toast.show({ type: "success", text1: "Profile saved" });
      router.back();
    } catch (e: any) {
      Toast.show({ type: "error", text1: e.response?.data?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={[typography.h1, { color: colors.purple, textAlign: "center", marginBottom: 8 }]}>Edit Your Profile</Text>
      <Text style={[typography.body, { color: colors.text, textAlign: "center", opacity: 0.8, fontStyle: "italic", marginBottom: 24 }]}>Update your professional information and portfolio</Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 }]}>1. Basic Information</Text>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.purple }]}>
            {user?.avatar ? (
              <Text style={{ color: "#fff" }}>Photo</Text>
            ) : (
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>
                {(formData.fullName || user?.fullName || "?").slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Button
              title="Change Photo"
              variant="secondary"
              onPress={pickImage}
              isLoading={isUploading}
              size="sm"
            />
            {user?.avatar ? (
              <Button
                title="Remove Photo"
                variant="secondary"
                size="sm"
                onPress={handleDeletePhoto}
                textStyle={{ color: colors.errorText }}
              />
            ) : null}
          </View>
        </View>

        {(["fullName", "jobTitle", "location", "bioHeadline"] as const).map((field) => (
          <View key={field} style={{ marginBottom: 16 }}>
            <Text style={[typography.label, { color: colors.textMuted, marginBottom: 8 }]}>{field}</Text>
            <TextInput
              value={(formData as any)[field]}
              onChangeText={(t) => setFormData({ ...formData, [field]: t })}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface2 },
              ]}
            />
          </View>
        ))}

        <Text style={[typography.label, { color: colors.textMuted, marginBottom: 8 }]}>About</Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={formData.detailedAbout}
          onChangeText={(t) => setFormData({ ...formData, detailedAbout: t })}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface2, minHeight: 100, textAlignVertical: "top" },
          ]}
        />

        <Text style={[typography.label, { color: colors.textMuted, marginTop: 8, marginBottom: 8 }]}>Skills (comma separated)</Text>
        <TextInput
          value={formData.skillsText}
          onChangeText={(t) => setFormData({ ...formData, skillsText: t })}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface2 },
          ]}
        />

        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <Button
            title="Save Local (web parity)"
            onPress={saveLocalOnly}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="Save to Server"
            onPress={saveToServer}
            isLoading={saving}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 80, maxWidth: 720, width: "100%", alignSelf: "center" },
  card: { borderRadius: 12, padding: 24, borderWidth: 1 },
  avatarRow: { flexDirection: "row", gap: 16, marginBottom: 24, alignItems: "center" },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
});
