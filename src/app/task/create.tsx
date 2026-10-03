import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Plus,
  X,
  Paperclip,
  Calendar,
  Flag,
} from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import {
  TaskCategory,
  TaskPriority,
  SubTask,
  TaskAttachment,
} from "../../types";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export default function CreateTaskScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("project");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [engineeringNotes, setEngineeringNotes] = useState("");

  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [tempSubtaskTitle, setTempSubtaskTitle] = useState("");
  const [tempSubtaskDueDate, setTempSubtaskDueDate] = useState("");

  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubtask = () => {
    if (!tempSubtaskTitle.trim()) return;
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: tempSubtaskTitle.trim(),
      completed: false,
      dueDate: tempSubtaskDueDate.trim() || null,
    };
    setSubtasks([...subtasks, newSubtask]);
    setTempSubtaskTitle("");
    setTempSubtaskDueDate("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handlePickAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploadingImage(true);
        const asset = result.assets[0];
        const uploaded = await uploadToCloudinary(
          asset.uri,
          asset.fileName || `task_att_${Date.now()}.jpg`,
        );

        const newAttachment: TaskAttachment = {
          id: Date.now().toString(),
          name: asset.fileName || "Attachment.jpg",
          url: uploaded.url,
          size: uploaded.size,
          type: "image",
        };

        setAttachments([...attachments, newAttachment]);
      }
    } catch (err: any) {
      Alert.alert("Upload failed", err.message || "Could not upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleCreateTask = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a task");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a task title");
      return;
    }

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      const newTask = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim() || "",
        category,
        priority,
        startDate: startDate.trim() || null,
        dueDate: dueDate.trim() || null,
        subtasks,
        progress: 0,
        isCompleted: false,
        attachments,
        engineeringNotes: engineeringNotes.trim() || "",
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(collection(db, "users", user.uid, "tasks"), newTask);
      router.back();
    } catch (error: any) {
      Alert.alert("Creation Failed", error.message || "Could not create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1A202C]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold">
          New Task / Sprint
        </Text>

        <TouchableOpacity
          onPress={handleCreateTask}
          disabled={isSubmitting}
          className="bg-[#6366F1] px-4 py-1.5 rounded-xl flex-row items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-xs font-bold">Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Task Category
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setCategory("project")}
              className={`flex-1 py-3 rounded-xl items-center border ${
                category === "project"
                  ? "bg-indigo-500/20 border-indigo-500"
                  : "bg-[#141A24] border-[#222836]"
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  category === "project" ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                Project
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCategory("learning")}
              className={`flex-1 py-3 rounded-xl items-center border ${
                category === "learning"
                  ? "bg-amber-500/20 border-amber-500"
                  : "bg-[#141A24] border-[#222836]"
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  category === "learning" ? "text-amber-400" : "text-gray-400"
                }`}
              >
                Learning
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Priority
          </Text>
          <View className="flex-row gap-2">
            {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  priority === p
                    ? p === "high"
                      ? "bg-rose-500/20 border-rose-500"
                      : p === "medium"
                        ? "bg-amber-500/20 border-amber-500"
                        : "bg-emerald-500/20 border-emerald-500"
                    : "bg-[#141A24] border-[#222836]"
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    priority === p
                      ? p === "high"
                        ? "text-rose-400"
                        : p === "medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      : "text-gray-400"
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Build Authentication System"
            placeholderTextColor="#64748B"
            className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-3 text-white text-base font-semibold"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief details about what needs to be achieved..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-3 text-white text-sm"
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Start Date
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="e.g. Oct 08, 2024"
              placeholderTextColor="#64748B"
              className="bg-[#141A24] border border-[#222836] rounded-xl px-3 py-2.5 text-white text-xs"
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Due Date (Optional)
            </Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="e.g. Oct 16, 2024"
              placeholderTextColor="#64748B"
              className="bg-[#141A24] border border-[#222836] rounded-xl px-3 py-2.5 text-white text-xs"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Subtasks ({subtasks.length})
          </Text>

          {subtasks.map((st) => (
            <View
              key={st.id}
              className="flex-row items-center justify-between bg-[#141A24] border border-[#202838] rounded-xl px-3.5 py-2.5 mb-2"
            >
              <View className="flex-1 mr-2">
                <Text className="text-white text-xs font-medium">
                  {st.title}
                </Text>
                {st.dueDate && (
                  <Text className="text-gray-500 text-[10px]">
                    Due: {st.dueDate}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleRemoveSubtask(st.id)}>
                <X size={15} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <View className="bg-[#141A24] border border-[#202838] rounded-xl p-3 mt-1">
            <TextInput
              value={tempSubtaskTitle}
              onChangeText={setTempSubtaskTitle}
              placeholder="Add subtask title..."
              placeholderTextColor="#64748B"
              className="text-white text-xs pb-2 border-b border-[#202838] mb-2"
            />
            <View className="flex-row items-center justify-between">
              <TextInput
                value={tempSubtaskDueDate}
                onChangeText={setTempSubtaskDueDate}
                placeholder="Due date (optional)"
                placeholderTextColor="#64748B"
                className="text-white text-xs flex-1 mr-2"
              />
              <TouchableOpacity
                onPress={handleAddSubtask}
                className="bg-[#1E2535] px-3 py-1.5 rounded-lg border border-[#2B3548] flex-row items-center gap-1"
              >
                <Plus size={12} color="#818CF8" />
                <Text className="text-indigo-400 text-xs font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Attachments & Media
            </Text>
            <TouchableOpacity
              onPress={handlePickAttachment}
              disabled={uploadingImage}
              className="flex-row items-center gap-1"
            >
              <Paperclip size={12} color="#818CF8" />
              <Text className="text-indigo-400 text-xs font-semibold">
                {uploadingImage ? "Uploading..." : "Attach Image"}
              </Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="py-2"
            >
              {attachments.map((att) => (
                <View
                  key={att.id}
                  className="w-28 bg-[#141A24] border border-[#202838] rounded-xl overflow-hidden mr-3 relative"
                >
                  <Image
                    source={{ uri: att.url }}
                    className="w-full h-16 bg-gray-800"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(att.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 items-center justify-center"
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View className="p-1.5">
                    <Text className="text-white text-[10px]" numberOfLines={1}>
                      {att.name}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View className="mb-10">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Engineering Note (Optional)
          </Text>
          <TextInput
            value={engineeringNotes}
            onChangeText={setEngineeringNotes}
            placeholder="Architecture notes, token expiration, sliding keys..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-[#141A24] border border-[#222836] rounded-xl px-4 py-3 text-white text-xs font-mono"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
