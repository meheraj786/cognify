import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  MoreVertical,
  Edit2,
  Folder,
  Flag,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Plus,
  GripVertical,
  Paperclip,
  Clock,
  Trash2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { Task, SubTask, TaskAttachment } from "../../types";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubtaskModalVisible, setIsSubtaskModalVisible] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const unsubscribe = onSnapshot(taskRef, (snapshot) => {
      if (snapshot.exists()) {
        setTask({ id: snapshot.id, ...snapshot.data() } as Task);
      } else {
        setTask(null);
      }
    });

    return () => unsubscribe();
  }, [user, id]);

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B0F17] justify-center items-center">
        <Text className="text-gray-400">Loading task details...</Text>
      </SafeAreaView>
    );
  }

  const completedSubtasksCount =
    task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!user || !task) return;

    const updatedSubtasks = task.subtasks.map((st) => {
      if (st.id === subtaskId) {
        const nextCompleted = !st.completed;
        return {
          ...st,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      }
      return st;
    });

    const nextCompletedCount = updatedSubtasks.filter(
      (s) => s.completed,
    ).length;
    const nextProgress =
      updatedSubtasks.length > 0
        ? Math.round((nextCompletedCount / updatedSubtasks.length) * 100)
        : task.progress;

    const isAllDone = nextProgress === 100;

    const taskRef = doc(db, "users", user.uid, "tasks", task.id);
    await updateDoc(taskRef, {
      subtasks: updatedSubtasks,
      progress: nextProgress,
      isCompleted: isAllDone,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSubtask = async () => {
    if (!user || !task || !newSubtaskTitle.trim()) return;

    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
      dueDate: newSubtaskDueDate.trim() || null,
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const nextProgress = Math.round(
      (completedCount / updatedSubtasks.length) * 100,
    );

    const taskRef = doc(db, "users", user.uid, "tasks", task.id);
    await updateDoc(taskRef, {
      subtasks: updatedSubtasks,
      progress: nextProgress,
      isCompleted: nextProgress === 100,
      updatedAt: new Date().toISOString(),
    });

    setNewSubtaskTitle("");
    setNewSubtaskDueDate("");
    setIsSubtaskModalVisible(false);
  };

  const handleAddAttachment = async () => {
    if (!user || !task) return;

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
          asset.fileName || `attachment_${Date.now()}.jpg`,
        );

        const newAttachment: TaskAttachment = {
          id: Date.now().toString(),
          name: asset.fileName || "Attachment.jpg",
          url: uploaded.url,
          size: uploaded.size,
          type: "image",
        };

        const updatedAttachments = [...(task.attachments || []), newAttachment];
        const taskRef = doc(db, "users", user.uid, "tasks", task.id);
        await updateDoc(taskRef, {
          attachments: updatedAttachments,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Error",
        error.message || "Failed to upload attachment",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !task) return;
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
          router.back();
        },
      },
    ]);
  };

  const isLearning = task.category === "learning";

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1A202C]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold">Task Details</Text>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={handleDeleteTask}
            className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center"
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-2">
          <View className="flex-row items-center gap-2">
            <Folder size={14} color="#818CF8" />
            <Text className="text-gray-400 text-xs font-medium">
              Tasks / Core Platform
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="p-1">
              <Edit2 size={14} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity className="p-1">
              <MoreVertical size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-3">
          <View
            className={`px-2.5 py-0.5 rounded-full ${
              isLearning ? "bg-amber-500/10" : "bg-indigo-500/10"
            }`}
          >
            <Text
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLearning ? "text-amber-400" : "text-indigo-400"
              }`}
            >
              {task.category}
            </Text>
          </View>

          {task.priority && (
            <View className="flex-row items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              <Flag size={11} color="#F59E0B" />
              <Text className="text-amber-400 text-[11px] font-bold capitalize">
                {task.priority} Priority
              </Text>
            </View>
          )}
        </View>

        <Text className="text-white text-2xl font-extrabold mb-2">
          {task.title}
        </Text>

        {task.description && (
          <Text className="text-gray-400 text-sm leading-relaxed mb-5">
            {task.description}
          </Text>
        )}

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                Overall Progress
              </Text>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-white text-3xl font-extrabold">
                  {task.progress}%
                </Text>
                <Text className="text-gray-400 text-xs font-medium">
                  {completedSubtasksCount} of {totalSubtasksCount} subtasks
                </Text>
              </View>
            </View>

            <View className="w-12 h-12 rounded-full border-2 border-emerald-500/30 items-center justify-center bg-emerald-500/10">
              <CheckCircle2 size={22} color="#10B981" />
            </View>
          </View>

          <View className="h-2 w-full bg-[#1E2535] rounded-full overflow-hidden mb-3">
            <View
              style={{ width: `${task.progress}%` }}
              className={`h-full rounded-full ${
                task.progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
              }`}
            />
          </View>

          <View className="flex-row items-center gap-1.5">
            <RefreshCw size={12} color="#64748B" />
            <Text className="text-gray-400 text-[11px]">
              Completing all subtasks marks this task completed automatically.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 mb-6">
          <View className="flex-1 bg-[#141A24] border border-[#202838] rounded-2xl p-4">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Calendar size={13} color="#94A3B8" />
              <Text className="text-gray-400 text-xs">Start Date</Text>
            </View>
            <Text className="text-white text-sm font-bold">
              {task.startDate || "Not set"}
            </Text>
          </View>

          <View className="flex-1 bg-[#141A24] border border-[#202838] rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-1.5">
                <Calendar size={13} color="#94A3B8" />
                <Text className="text-gray-400 text-xs">Due Date</Text>
              </View>
              {task.dueDate && (
                <View className="bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <Text className="text-amber-400 text-[9px] font-bold">
                    Active
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-white text-sm font-bold">
              {task.dueDate || "No deadline"}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-base font-bold">Subtasks</Text>
              <View className="bg-[#1C2333] px-2 py-0.5 rounded-full">
                <Text className="text-gray-300 text-xs font-bold">
                  {completedSubtasksCount}/{totalSubtasksCount}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsSubtaskModalVisible(true)}
              className="flex-row items-center gap-1 bg-[#1A2232] px-2.5 py-1.5 rounded-lg border border-[#252F42]"
            >
              <Plus size={13} color="#818CF8" />
              <Text className="text-indigo-400 text-xs font-semibold">
                Add Subtask
              </Text>
            </TouchableOpacity>
          </View>

          {task.subtasks && task.subtasks.length > 0 ? (
            task.subtasks.map((st) => (
              <View
                key={st.id}
                className="flex-row items-center bg-[#141A24] border border-[#202838] rounded-xl p-3.5 mb-2.5 gap-3"
              >
                <GripVertical size={16} color="#475569" />

                <TouchableOpacity
                  onPress={() => handleToggleSubtask(st.id)}
                  className={`w-5 h-5 rounded-md border items-center justify-center ${
                    st.completed
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-600 bg-transparent"
                  }`}
                >
                  {st.completed && <CheckCircle2 size={13} color="#FFFFFF" />}
                </TouchableOpacity>

                <View className="flex-1">
                  <Text
                    className={`text-sm ${
                      st.completed
                        ? "text-gray-500 line-through"
                        : "text-white font-medium"
                    }`}
                  >
                    {st.title}
                  </Text>
                  {st.dueDate && (
                    <Text className="text-[11px] text-gray-500 mt-0.5">
                      Due {st.dueDate}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-[#141A24] border border-[#202838] rounded-xl p-4 items-center justify-center">
              <Text className="text-gray-500 text-xs">
                No subtasks added yet.
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-bold">
              Attachments & Specs
            </Text>
            <TouchableOpacity
              onPress={handleAddAttachment}
              disabled={uploadingImage}
              className="flex-row items-center gap-1 bg-[#1A2232] px-2.5 py-1.5 rounded-lg border border-[#252F42]"
            >
              <Paperclip size={13} color="#818CF8" />
              <Text className="text-indigo-400 text-xs font-semibold">
                {uploadingImage ? "Uploading..." : "Add Asset"}
              </Text>
            </TouchableOpacity>
          </View>

          {task.attachments && task.attachments.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 px-5"
            >
              {task.attachments.map((att) => (
                <View
                  key={att.id}
                  className="w-40 bg-[#141A24] border border-[#202838] rounded-xl overflow-hidden mr-3"
                >
                  {att.type === "image" ? (
                    <Image
                      source={{ uri: att.url }}
                      className="w-full h-24 bg-gray-800"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-24 bg-[#1E2535] items-center justify-center">
                      <Paperclip size={24} color="#94A3B8" />
                    </View>
                  )}
                  <View className="p-2.5">
                    <Text
                      className="text-white text-xs font-semibold"
                      numberOfLines={1}
                    >
                      {att.name}
                    </Text>
                    {att.size && (
                      <Text className="text-gray-500 text-[10px] mt-0.5">
                        {att.size}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-[#141A24] border border-[#202838] rounded-xl p-4 items-center justify-center">
              <Text className="text-gray-500 text-xs">
                No attachments uploaded.
              </Text>
            </View>
          )}
        </View>

        {task.engineeringNotes && (
          <View className="mb-6">
            <Text className="text-white text-base font-bold mb-3">
              Engineering Note
            </Text>
            <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-4">
              <Text className="text-gray-300 text-xs leading-relaxed font-mono">
                {task.engineeringNotes}
              </Text>
            </View>
          </View>
        )}

        <View className="mb-10">
          <Text className="text-white text-base font-bold mb-3">
            Activity Timeline
          </Text>
          <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-4">
            <View className="flex-row items-start gap-3">
              <View className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
              <View className="flex-1">
                <Text className="text-white text-xs font-semibold">
                  Task created
                </Text>
                <Text className="text-gray-500 text-[10px] mt-0.5">
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : "Recently"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isSubtaskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSubtaskModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-5">
          <View className="w-full bg-[#151A24] border border-[#263042] rounded-2xl p-5">
            <Text className="text-white text-lg font-bold mb-4">
              Add Subtask
            </Text>

            <TextInput
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              placeholder="Subtask title (e.g. Implement schema)"
              placeholderTextColor="#64748B"
              className="bg-[#0B0F17] border border-[#222C3D] rounded-xl px-4 py-3 text-white text-sm mb-3"
            />

            <TextInput
              value={newSubtaskDueDate}
              onChangeText={setNewSubtaskDueDate}
              placeholder="Due date (optional, e.g. Oct 15)"
              placeholderTextColor="#64748B"
              className="bg-[#0B0F17] border border-[#222C3D] rounded-xl px-4 py-3 text-white text-sm mb-5"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsSubtaskModalVisible(false)}
                className="flex-1 bg-[#1E2535] py-3 rounded-xl items-center"
              >
                <Text className="text-gray-300 font-semibold text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddSubtask}
                className="flex-1 bg-[#6366F1] py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
