import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { ChatProvider } from "../src/context/ChatContext";
import { rehydrateAuth } from "../src/store/slices/authSlice";
import { store } from "../src/store/store";
import { ThemeProvider } from "../src/theme/ThemeContext";

function AuthHydrate({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("user");
        if (token && userJson) {
          dispatch(rehydrateAuth({ token, user: JSON.parse(userJson) }));
        }
      } catch {
        /* ignore */
      } finally {
        setReady(true);
      }
    })();
  }, [dispatch]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthHydrate>
          <ChatProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast />
          </ChatProvider>
        </AuthHydrate>
      </ThemeProvider>
    </Provider>
  );
}
