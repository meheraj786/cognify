import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  Calendar,
  ExternalLink,
  Share2,
  X,
} from 'lucide-react-native';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Note } from '../../types';

const { width } = Dimensions.get('window');

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    const noteRef = doc(db, 'users', user.uid, 'notes', id);
    const unsubscribe = onSnapshot(noteRef, (snapshot) => {
      if (snapshot.exists()) {
        setNote({ id: snapshot.id, ...snapshot.data() } as Note);
      } else {
        setNote(null);
      }
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleDeleteNote = async () => {
    if (!user || !id) return;
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
          router.back();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B0F17] justify-center items-center">
        <Text className="text-gray-400">Loading knowledge note...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1A202C]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold">Knowledge Vault</Text>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={handleDeleteNote}
            className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2 flex-wrap mb-3">
          {note.tags && note.tags.map((t, idx) => (
            <View key={idx} className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Text className="text-amber-400 text-xs font-semibold">{t}</Text>
            </View>
          ))}
        </View>

        <Text className="text-white text-2xl font-extrabold leading-tight mb-3">
          {note.title}
        </Text>

        <View className="flex-row items-center gap-1.5 mb-6 pb-4 border-b border-[#1A202C]">
          <Calendar size={13} color="#64748B" />
          <Text className="text-gray-400 text-xs">
            {note.createdAt ? new Date(note.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'Recently added'}
          </Text>
        </View>

        {note.linkPreview && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => note.linkPreview?.url && Linking.openURL(note.linkPreview.url)}
            className="bg-[#141A24] border border-[#202838] rounded-2xl overflow-hidden mb-6"
          >
            {note.linkPreview.image && (
              <Image
                source={{ uri: note.linkPreview.image }}
                className="w-full h-44 bg-gray-800"
                resizeMode="cover"
              />
            )}
            <View className="p-4">
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <ExternalLink size={13} color="#818CF8" />
                <Text className="text-indigo-400 text-xs font-semibold" numberOfLines={1}>
                  {note.linkPreview.url}
                </Text>
              </View>
              {note.linkPreview.title && (
                <Text className="text-white text-base font-bold mb-1">
                  {note.linkPreview.title}
                </Text>
              )}
              {note.linkPreview.description && (
                <Text className="text-gray-400 text-xs leading-relaxed" numberOfLines={3}>
                  {note.linkPreview.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-5 mb-6">
          <Text className="text-gray-200 text-base leading-relaxed tracking-wide font-normal">
            {note.content}
          </Text>
        </View>

        {note.images && note.images.length > 0 && (
          <View className="mb-12">
            <Text className="text-white text-base font-bold mb-3">
              Images & Screenshots ({note.images.length})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {note.images.map((imgUri, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => setSelectedImage(imgUri)}
                  className="rounded-xl overflow-hidden border border-[#202838]"
                  style={{ width: (width - 52) / 2, height: 140 }}
                >
                  <Image
                    source={{ uri: imgUri }}
                    className="w-full h-full bg-gray-800"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="absolute top-12 right-5 z-20 w-10 h-10 rounded-full bg-gray-900/80 items-center justify-center border border-gray-700"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-4/5"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}