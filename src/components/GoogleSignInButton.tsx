import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const clientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

const platformClientId =
  Platform.OS === "web"
    ? clientIds.webClientId
    : Platform.OS === "ios"
      ? clientIds.iosClientId
      : clientIds.androidClientId;

export function GoogleSignInButton() {
  if (!platformClientId) {
    return (
      <View className="mt-3">
        <TouchableOpacity
          disabled
          className="flex-row items-center justify-center gap-2 rounded-xl border border-[#293244] bg-[#0B0F17] py-3.5 opacity-60"
        >
          <GoogleMark />
          <Text className="text-sm font-semibold text-white">
            Continue with Google
          </Text>
        </TouchableOpacity>
        <Text className="mt-2 text-center text-xs text-gray-500">
          Google sign-in needs an OAuth client ID for this platform.
        </Text>
      </View>
    );
  }

  return <ConfiguredGoogleSignInButton />;
}

function ConfiguredGoogleSignInButton() {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest(clientIds);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") return;

      const idToken = result.params.id_token;
      if (!idToken) {
        Alert.alert(
          "Google sign-in failed",
          "Google did not return an ID token.",
        );
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Google sign-in failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!request || loading}
      className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-[#293244] bg-[#0B0F17] py-3.5"
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <GoogleMark />}
      <Text className="text-sm font-semibold text-white">
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
}

function GoogleMark() {
  return (
    <View className="h-5 w-5 items-center justify-center rounded-full bg-white">
      <Text className="text-sm font-bold" style={{ color: "#4285F4" }}>
        G
      </Text>
    </View>
  );
}
