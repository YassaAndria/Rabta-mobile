/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../src/store/store";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { z } from "zod";
import { loginUser } from "../src/api/auth";
import { getApiErrorMessage } from "../src/api/getApiErrorMessage";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";
import ScreenWrapper from "../src/components/layout/ScreenWrapper";
import { setCredentials } from "../src/store/slices/authSlice";
import { useTheme } from "../src/theme/ThemeContext";
import { typography } from "../src/theme/typography";

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const getApiBase = () =>
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// Google OAuth Client ID from .env
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Pre-warm the browser for faster auth popup
WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery document (standard endpoints)
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { colors, isDark } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!authUser?.jobTitle && !authUser?.bioHeadline) {
      router.replace("/setup-profile");
    } else {
      router.replace("/chats");
    }
  }, [isAuthenticated, authUser, router]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Build the redirect URI for Expo AuthSession
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "rabta" });

  // Create the OAuth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri,
    },
    discovery,
  );

  // Handle the Google OAuth response
  useEffect(() => {
    if (response?.type === "success" && response.params?.id_token) {
      void handleGoogleToken(response.params.id_token);
    } else if (response?.type === "error") {
      Toast.show({ type: "error", text1: "Google login failed. Please try again." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const baseURL = getApiBase();
      const res = await fetch(`${baseURL}/auth/google/mobile-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        const msg = data.message || "Google login failed.";
        setApiError(msg);
        Toast.show({ type: "error", text1: msg });
        return;
      }

      await AsyncStorage.setItem("token", data.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.data.user));
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
      Toast.show({ type: "success", text1: "Successfully logged in with Google!" });

      if (data.data.user.role === "employer" && data.data.profileComplete) {
        router.replace("/employer-dashboard");
      } else if (!data.data.profileComplete) {
        router.replace("/setup-profile");
      } else {
        router.replace("/freelancer-dashboard");
      }
    } catch (error: any) {
      const msg = error?.message || "Google login failed. Please try again.";
      setApiError(msg);
      Toast.show({ type: "error", text1: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    void promptAsync();
  };

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null);
    try {
      const responseData = await loginUser({ email: data.email, password: data.password });
      dispatch(setCredentials({ user: responseData.user, token: responseData.token }));
      Toast.show({ type: "success", text1: "Successfully logged in!" });
      if (responseData.user.role === "employer" && responseData.profileComplete) {
        router.replace("/employer-dashboard");
      } else if (!responseData.profileComplete) {
        router.replace("/setup-profile");
      } else {
        router.replace("/freelancer-dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Login failed. Please check your credentials.");
      setApiError(errorMessage);
      Toast.show({ type: "error", text1: errorMessage });
    }
  };


  return (
    <ScreenWrapper scroll contentContainerStyle={styles.scrollContent} extraBottomPadding={48}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.purple} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scrollPadding}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.centerBlock}>
            <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>Welcome Back</Text>
            <Text style={[typography.body, { color: colors.textSubtle }]}>
              Enter your credentials to continue
            </Text>
          </View>

          {apiError ? (
            <View style={[styles.banner, { backgroundColor: colors.errorBg, borderColor: colors.errorText }]}>
              <Text style={[styles.bannerText, { color: colors.errorText }]}>{apiError}</Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Email" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Enter your email" autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
            )}
          />

          <Text style={[typography.label, { color: colors.textMuted, marginBottom: 8 }]}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passWrap}>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSubtle}
                  style={[
                    styles.passInput,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: errors.password ? colors.errorText : colors.borderStrong,
                      color: colors.text,
                    },
                  ]}
                />
                <Pressable style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={22} color={colors.textSubtle} />
                </Pressable>
              </View>
            )}
          />
          {errors.password ? <Text style={[typography.caption, { color: colors.errorText, marginBottom: 8 }]}>{errors.password.message}</Text> : null}

          <View style={styles.forgotRow}>
            <Button
              title="Forgot Password?"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/forgot-password")}
            />
          </View>

          <Button
            title="Log In"
            variant="secondary"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            style={{ marginTop: 8, marginBottom: 8 }}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: colors.borderStrong }]} />
            <Text style={[styles.dividerMid, { backgroundColor: colors.surface, color: colors.textSubtle }]}>
              Or continue with
            </Text>
            <View style={[styles.line, { backgroundColor: colors.borderStrong }]} />
          </View>

          <Button
            title={googleLoading ? "Signing in..." : "Login with Google"}
            variant="secondary"
            onPress={handleGoogleLogin}
            isLoading={googleLoading}
            disabled={!request || googleLoading}
            icon={!googleLoading ? <MaterialIcons name="login" size={20} color={colors.text} /> : undefined}
          />

          <View style={styles.footerRow}>
            <Text style={[typography.body, { color: colors.textSubtle }]}>Don&apos;t have an account? </Text>
            <Button
              title="Sign Up"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/signup")}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scrollPadding: { paddingHorizontal: 16, paddingVertical: 32, alignItems: "center" },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  centerBlock: { alignItems: "center", marginBottom: 24 },
  banner: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  bannerText: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  passWrap: { position: "relative", marginBottom: 8 },
  passInput: { paddingHorizontal: 16, paddingVertical: 12, paddingRight: 48, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  eye: { position: "absolute", right: 12, top: 14 },
  forgotRow: { alignSelf: "flex-end", marginBottom: 24, marginRight: -8 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1 },
  dividerMid: { paddingHorizontal: 16, fontSize: 14, fontWeight: "600" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
});
