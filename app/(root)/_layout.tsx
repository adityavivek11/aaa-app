import { Redirect, Slot , Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { useGlobalContext } from "@/lib/global-provider";

export default function AppLayout() {
  const { loading, isLogged } = useGlobalContext();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />  
      </SafeAreaView>
    );
  }

  if (!isLogged) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "#000000" }} // Light gray background to prevent white flash
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#ffffff", // Same color for consistency
          borderColor: "rgba(0, 0, 0, 0.1)", // Very light black border
          borderWidth: 1,
        }}

      >
    
      <Stack screenOptions={{ headerShown: false }} />
    
        
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
