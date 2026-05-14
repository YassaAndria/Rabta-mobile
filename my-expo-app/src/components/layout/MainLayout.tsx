import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CallProvider } from "../../context/CallContext";
import { useTheme } from "../../theme/ThemeContext";
import LeftSidebar from "./LeftSidebar";
import { AppStatusBar } from "./AppStatusBar";

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <CallProvider>
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.bg,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <AppStatusBar />
        <LeftSidebar />
        <View style={styles.main}>{children}</View>
      </View>
    </CallProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});
