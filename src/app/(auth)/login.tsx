import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckSquare, Lock, Mail, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/40 mb-4">
              <CheckSquare size={32} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-tight">Cognify</Text>
            <Text className="text-gray-400 text-sm mt-1">Focus, tasks, and knowledge vault</Text>
          </View>

          <View className="bg-[#141A24] border border-[#202838] rounded-3xl p-6 mb-6">
            <Text className="text-white text-xl font-bold mb-5">Sign In</Text>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-[#0B0F17] border border-[#222C3D] rounded-xl px-3.5 py-3">
                <Mail size={16} color="#64748B" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="developer@example.com"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-white text-sm ml-2.5"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-[#0B0F17] border border-[#222C3D] rounded-xl px-3.5 py-3">
                <Lock size={16} color="#64748B" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  className="flex-1 text-white text-sm ml-2.5"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-[#6366F1] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm">Continue to Workspace</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center gap-1.5">
            <Text className="text-gray-400 text-xs">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text className="text-indigo-400 text-xs font-bold">Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}