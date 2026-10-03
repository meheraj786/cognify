import { router } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Account";
  const provider =
    user?.providerData[0]?.providerId === "google.com" ? "Google" : "Email";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Sign out failed", message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={["top"]}>
      <View className="flex-row items-center gap-3 border-b border-[#1A202C] px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-9 w-9 items-center justify-center rounded-full bg-[#161B26]"
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white">Profile</Text>
      </View>

      <View className="px-5 pt-8">
        <View className="items-center border-b border-[#1E2638] pb-8">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-indigo-400/40 bg-indigo-950">
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="h-full w-full"
              />
            ) : (
              <UserRound size={38} color="#A5B4FC" />
            )}
          </View>
          <Text className="mt-4 text-xl font-bold text-white">
            {displayName}
          </Text>
          <Text className="mt-1 text-sm text-gray-400">{user?.email}</Text>
        </View>

        <Text className="mb-3 mt-7 text-xs font-semibold uppercase text-gray-500">
          Account
        </Text>
        <View className="overflow-hidden rounded-xl border border-[#202838] bg-[#141A24]">
          <View className="flex-row items-center gap-3 border-b border-[#202838] px-4 py-4">
            <Mail size={18} color="#94A3B8" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Email address</Text>
              <Text className="mt-1 text-sm text-white">
                {user?.email || "Not set"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 px-4 py-4">
            <ShieldCheck size={18} color="#94A3B8" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Sign-in method</Text>
              <Text className="mt-1 text-sm text-white">{provider}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-8 flex-row items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3.5"
        >
          <LogOut size={17} color="#FDA4AF" />
          <Text className="text-sm font-semibold text-rose-200">Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
