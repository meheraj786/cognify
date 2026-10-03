import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckSquare,
  Search,
  Plus,
  BookOpen,
  Tag,
  ExternalLink,
  Calendar,
  Trash2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Note } from '../../types';

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Note[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Note);
      });
      setNotes(list);
    });

    return () => unsubscribe();
  }, [user]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => {
      n.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (selectedTag === 'all') return notes;
    return notes.filter((n) => n.tags?.includes(selectedTag));
  }, [notes, selectedTag]);

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Meheraj';

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#1A202C]">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-lg bg-indigo-600 items-center justify-center">
            <CheckSquare size={18} color="#FFFFFF" />
          </View>
          <Text className="text-white text-lg font-bold">Notes Vault</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center">
            <Search size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/profile' as any)}
            className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-500/40 overflow-hidden items-center justify-center"
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} className="w-full h-full" />
            ) : (
              <Text className="text-indigo-300 font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-2xl font-extrabold">Knowledge Vault</Text>
            <View className="bg-[#21293B] px-2.5 py-0.5 rounded-full">
              <Text className="text-indigo-400 text-xs font-bold">{notes.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/note/create')}
            className="flex-row items-center gap-1.5 bg-[#6366F1] px-3.5 py-2 rounded-xl"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-white text-xs font-bold">New Note</Text>
          </TouchableOpacity>
        </View>

        {allTags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5 mb-3">
            <TouchableOpacity
              onPress={() => setSelectedTag('all')}
              className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                selectedTag === 'all'
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-[#151922] border-[#222836]'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedTag === 'all' ? 'text-indigo-300' : 'text-gray-400'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  selectedTag === tag
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'bg-[#151922] border-[#222836]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selectedTag === tag ? 'text-amber-300' : 'text-gray-400'
                  }`}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/note/${note.id}`)}
              className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5 flex-wrap">
                  {note.tags && note.tags.length > 0 ? (
                    note.tags.map((t, idx) => (
                      <View key={idx} className="bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <Text className="text-amber-400 text-[11px] font-semibold">{t}</Text>
                      </View>
                    ))
                  ) : (
                    <View className="bg-gray-800 px-2 py-0.5 rounded-md">
                      <Text className="text-gray-400 text-[11px]">#note</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteNote(note.id)}
                  className="p-1"
                >
                  <Trash2 size={14} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text className="text-white text-base font-bold mb-1.5">{note.title}</Text>

              <Text className="text-gray-400 text-xs leading-relaxed mb-3" numberOfLines={2}>
                {note.content}
              </Text>

              {note.linkPreview && (
                <TouchableOpacity
                  onPress={() => note.linkPreview?.url && Linking.openURL(note.linkPreview.url)}
                  className="bg-[#0D121B] border border-[#1E2536] rounded-xl p-2.5 mb-3 flex-row items-center gap-3"
                >
                  {note.linkPreview.image && (
                    <Image
                      source={{ uri: note.linkPreview.image }}
                      className="w-14 h-14 rounded-lg bg-gray-800"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1">
                      <ExternalLink size={11} color="#818CF8" />
                      <Text className="text-indigo-400 text-[11px] font-semibold" numberOfLines={1}>
                        {note.linkPreview.url}
                      </Text>
                    </View>
                    {note.linkPreview.title && (
                      <Text className="text-white text-xs font-bold mt-0.5" numberOfLines={1}>
                        {note.linkPreview.title}
                      </Text>
                    )}
                    {note.linkPreview.description && (
                      <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>
                        {note.linkPreview.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {note.images && note.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {note.images.map((imgUrl, i) => (
                    <Image
                      key={i}
                      source={{ uri: imgUrl }}
                      className="w-20 h-20 rounded-lg mr-2 bg-gray-800"
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}

              <View className="flex-row items-center justify-between pt-2 border-t border-[#1C2333]">
                <View className="flex-row items-center gap-1">
                  <Calendar size={11} color="#64748B" />
                  <Text className="text-gray-500 text-[10px]">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-8 items-center justify-center my-6">
            <BookOpen size={32} color="#475569" className="mb-2" />
            <Text className="text-gray-400 text-sm font-semibold">No notes found</Text>
            <Text className="text-gray-600 text-xs mt-1 text-center">
              Add new engineering notes, articles, or bookmarks to your vault.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}