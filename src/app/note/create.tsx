import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Plus,
  X,
  Link2,
  Image as ImageIcon,
  Tag,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { LinkPreviewData } from '../../types';

export default function CreateNoteScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['#backend']);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [fetchingLink, setFetchingLink] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (!currentTagInput.trim()) return;
    let formatted = currentTagInput.trim();
    if (!formatted.startsWith('#')) {
      formatted = `#${formatted}`;
    }
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setCurrentTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFetchLinkPreview = async () => {
    if (!linkUrl.trim()) return;
    try {
      setFetchingLink(true);
      const targetUrl = linkUrl.trim().startsWith('http')
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;

      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`);
      const json = await res.json();

      if (json.status === 'success' && json.data) {
        setLinkPreview({
          url: targetUrl,
          title: json.data.title || targetUrl,
          description: json.data.description,
          image: json.data.image?.url,
        });
      } else {
        setLinkPreview({
          url: targetUrl,
          title: targetUrl,
        });
      }
    } catch {
      setLinkPreview({
        url: linkUrl.trim(),
        title: linkUrl.trim(),
      });
    } finally {
      setFetchingLink(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploadingImage(true);
        const uploaded = await uploadToCloudinary(result.assets[0].uri);
        setImages([...images, uploaded.url]);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    setImages(images.filter((img) => img !== imgUrl));
  };

  const handleSaveNote = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save notes');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Please enter a title and content');
      return;
    }

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      const newNote = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        tags,
        images,
        linkPreview: linkPreview || null,
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1A202C]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold">New Knowledge Note</Text>

        <TouchableOpacity
          onPress={handleSaveNote}
          disabled={isSubmitting}
          className="bg-[#6366F1] px-4 py-1.5 rounded-xl flex-row items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-xs font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. JWT Refresh Token Rotation Best Practices"
            placeholderTextColor="#64748B"
            className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-3 text-white text-base font-semibold"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Tags
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <View
                key={t}
                className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex-row items-center gap-1.5"
              >
                <Text className="text-amber-400 text-xs font-semibold">{t}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(t)}>
                  <X size={12} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="flex-row items-center gap-2">
            <TextInput
              value={currentTagInput}
              onChangeText={setCurrentTagInput}
              placeholder="Add tag (e.g. #security)"
              placeholderTextColor="#64748B"
              className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-2.5 text-white text-xs flex-1"
            />
            <TouchableOpacity
              onPress={handleAddTag}
              className="bg-[#1E2535] px-3.5 py-2.5 rounded-xl border border-[#2B3548]"
            >
              <Plus size={16} color="#818CF8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Content & Reading Summary *
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write key concepts, code snippets, architectural takeaways..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-3 text-white text-sm min-h-[140px]"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Attach Link & Preview
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
            <TextInput
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="https://example.com/article"
              placeholderTextColor="#64748B"
              className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-2.5 text-white text-xs flex-1"
            />
            <TouchableOpacity
              onPress={handleFetchLinkPreview}
              disabled={fetchingLink}
              className="bg-[#1E2535] px-3.5 py-2.5 rounded-xl border border-[#2B3548]"
            >
              {fetchingLink ? (
                <ActivityIndicator size="small" color="#818CF8" />
              ) : (
                <Link2 size={16} color="#818CF8" />
              )}
            </TouchableOpacity>
          </View>

          {linkPreview && (
            <View className="bg-[#0D121B] border border-[#1E2536] rounded-xl p-3 flex-row items-center gap-3 relative">
              <TouchableOpacity
                onPress={() => setLinkPreview(null)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-800 items-center justify-center z-10"
              >
                <X size={12} color="#FFFFFF" />
              </TouchableOpacity>
              {linkPreview.image && (
                <Image
                  source={{ uri: linkPreview.image }}
                  className="w-14 h-14 rounded-lg bg-gray-800"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 pr-6">
                <Text className="text-white text-xs font-bold" numberOfLines={1}>
                  {linkPreview.title}
                </Text>
                {linkPreview.description && (
                  <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={2}>
                    {linkPreview.description}
                  </Text>
                )}
                <Text className="text-indigo-400 text-[10px] mt-1" numberOfLines={1}>
                  {linkPreview.url}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Images ({images.length})
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploadingImage}
              className="flex-row items-center gap-1"
            >
              <ImageIcon size={13} color="#818CF8" />
              <Text className="text-indigo-400 text-xs font-semibold">
                {uploadingImage ? 'Uploading...' : 'Add Image'}
              </Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
              {images.map((imgUri, index) => (
                <View
                  key={index}
                  className="w-24 h-24 bg-[#141A24] border border-[#202838] rounded-xl overflow-hidden mr-3 relative"
                >
                  <Image source={{ uri: imgUri }} className="w-full h-full bg-gray-800" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(imgUri)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 items-center justify-center"
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}