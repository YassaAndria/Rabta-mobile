import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { typography } from "../../theme/typography";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  style,
  textStyle,
  icon,
  ...props
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  // ── Variant Styles ──────────────────────────────────────────────
  const getVariantStyles = (): { bg: string; border: string; text: string } => {
    switch (variant) {
      case "primary":
        return {
          bg: colors.purple,
          border: colors.purple,
          text: "#FFFFFF",
        };
      case "secondary":
        return {
          bg: isDark ? "rgba(139, 92, 246, 0.15)" : "#F3E8FF",
          border: colors.purple,
          text: isDark ? "#C4B5FD" : colors.purpleDark,
        };
      case "outline":
        return {
          bg: "transparent",
          border: colors.purple,
          text: colors.purple,
        };
      case "ghost":
        return {
          bg: isDark ? "rgba(255,255,255,0.06)" : "rgba(124, 58, 237, 0.06)",
          border: colors.purple,
          text: colors.purple,
        };
      case "text":
        return {
          bg: "transparent",
          border: colors.purple,
          text: colors.purple,
        };
      case "danger":
        return {
          bg: colors.errorBg,
          border: colors.purple,
          text: colors.errorText,
        };
      default:
        return {
          bg: colors.purple,
          border: colors.purple,
          text: "#FFFFFF",
        };
    }
  };

  // ── Size Styles ─────────────────────────────────────────────────
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 10,
          fontSize: typography.bodySmall.fontSize,
          fontWeight: "600" as const,
        };
      case "md":
        return {
          paddingVertical: 13,
          paddingHorizontal: 24,
          borderRadius: 12,
          fontSize: typography.button.fontSize,
          fontWeight: typography.button.fontWeight,
        };
      case "lg":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 14,
          fontSize: 18,
          fontWeight: typography.button.fontWeight,
        };
      default:
        return {
          paddingVertical: 13,
          paddingHorizontal: 24,
          borderRadius: 12,
          fontSize: typography.button.fontSize || 16,
          fontWeight: typography.button.fontWeight || "700",
        };
    }
  };

  const variantStyle = getVariantStyles() || { bg: colors.purple, border: colors.purple, text: "#FFFFFF" };
  const sizeStyle = getSizeStyles() || { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, fontSize: 16, fontWeight: "700" };
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: 2,
          borderStyle: "solid",
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
          opacity: isDisabled ? 0.5 : pressed ? 0.75 : 1,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variantStyle.text} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text
            style={[
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
                fontWeight: sizeStyle.fontWeight,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
