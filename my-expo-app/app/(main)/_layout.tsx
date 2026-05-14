import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";
import { MainLayout } from "../../src/components/layout/MainLayout";
import type { RootState } from "../../src/store/store";

export default function MainGroupLayout() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <MainLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </MainLayout>
  );
}
