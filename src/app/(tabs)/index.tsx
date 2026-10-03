import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckSquare,
  Search,
  BookOpen,
  ChevronRight,
  Play,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react-native";
import { router } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { Task, Note } from "../../types";
import { TaskCard } from "../../components/TaskCard";

export default function HomeScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, "users", user.uid, "tasks"));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList: Task[] = [];
      snapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(taskList);
    });

    const notesQuery = query(collection(db, "users", user.uid, "notes"));

    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      const noteList: Note[] = [];
      snapshot.forEach((doc) => {
        noteList.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(noteList);
    });

    return () => {
      unsubTasks();
      unsubNotes();
    };
  }, [user]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const learningTasks = tasks.filter(
    (t) => t.category === "learning" && !t.isCompleted,
  );
  const projectTasks = tasks.filter(
    (t) => t.category === "project" && !t.isCompleted,
  );

  const focusPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeFocusTasks = pendingTasks.slice(0, 2);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Meheraj";

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F17]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#1A202C]">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-lg bg-indigo-600 items-center justify-center">
            <CheckSquare size={18} color="#FFFFFF" />
          </View>
          <Text className="text-white text-lg font-bold">Home</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center">
            <Search size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/profile" as any)}
            className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-500/40 overflow-hidden items-center justify-center"
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-indigo-300 font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      >
        <View className="mt-4 mb-5">
          <Text className="text-white text-2xl font-bold">
            Good evening, {displayName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-gray-400 text-sm">Thursday, Oct 12</Text>
            <View className="w-1 h-1 rounded-full bg-gray-500" />
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-emerald-400 text-xs font-medium">
                You are in flow
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="self-start bg-[#1F2737] px-2.5 py-0.5 rounded-full mb-2">
                <Text className="text-gray-300 text-[11px] font-bold uppercase tracking-wider">
                  Today's Rhythm
                </Text>
              </View>
              <Text className="text-white text-2xl font-extrabold">
                {completedTasks}{" "}
                <Text className="text-base font-normal text-gray-400">
                  of {totalTasks} completed
                </Text>
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                {Math.max(0, totalTasks - completedTasks)} remaining to hit your
                daily focus target.
              </Text>
            </View>

            <View className="w-16 h-16 rounded-full border-4 border-indigo-500/30 items-center justify-center relative">
              <Text className="text-white text-base font-bold">
                {focusPercent}%
              </Text>
              <Text className="text-gray-400 text-[9px] uppercase font-semibold">
                focus
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-4 border-t border-[#1F2738]">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-amber-400" />
              <Text className="text-gray-400 text-xs">Pending</Text>
              <Text className="text-white text-xs font-semibold">
                {pendingTasks.length} tasks
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-indigo-400" />
              <Text className="text-gray-400 text-xs">Learning</Text>
              <Text className="text-white text-xs font-semibold">
                {learningTasks.length} goals
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-gray-400 text-xs">Projects</Text>
              <Text className="text-white text-xs font-semibold">
                {projectTasks.length} active
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-base font-bold">
                Active Focus Tasks
              </Text>
              <View className="bg-[#1C2333] px-2 py-0.5 rounded-full">
                <Text className="text-gray-300 text-xs font-bold">
                  {activeFocusTasks.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tasks")}>
              <Text className="text-indigo-400 text-xs font-semibold">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {activeFocusTasks.length > 0 ? (
            activeFocusTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-6 items-center justify-center">
              <Text className="text-gray-400 text-sm">
                No active tasks right now.
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <BookOpen size={16} color="#818CF8" />
              <Text className="text-white text-base font-bold">
                Continue Learning
              </Text>
            </View>
            <Text className="text-gray-400 text-xs">
              {learningTasks.length} paths active
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            <View className="w-64 bg-[#141A24] border border-[#202838] rounded-2xl p-4 mr-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  <Text className="text-indigo-400 text-[10px] font-bold">
                    TYPESCRIPT
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs font-semibold">
                  67% done
                </Text>
              </View>
              <Text className="text-white font-bold text-sm mb-3">
                Master TypeScript Generics
              </Text>
              <View className="bg-[#1B2231] rounded-xl p-2.5 flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                  <Play size={12} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 uppercase font-medium">
                    Up next
                  </Text>
                  <Text
                    className="text-white text-xs font-medium"
                    numberOfLines={1}
                  >
                    Conditional Types
                  </Text>
                </View>
              </View>
              <View className="h-1 bg-[#202838] rounded-full mt-3 overflow-hidden">
                <View
                  style={{ width: "67%" }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </View>
            </View>

            <View className="w-64 bg-[#141A24] border border-[#202838] rounded-2xl p-4 mr-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Text className="text-emerald-400 text-[10px] font-bold">
                    MOBILE ANIMATION
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs font-semibold">
                  40% done
                </Text>
              </View>
              <Text className="text-white font-bold text-sm mb-3">
                React Native Reanimated
              </Text>
              <View className="bg-[#1B2231] rounded-xl p-2.5 flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                  <Play size={12} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 uppercase font-medium">
                    Up next
                  </Text>
                  <Text
                    className="text-white text-xs font-medium"
                    numberOfLines={1}
                  >
                    Gesture Handler
                  </Text>
                </View>
              </View>
              <View className="h-1 bg-[#202838] rounded-full mt-3 overflow-hidden">
                <View
                  style={{ width: "40%" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </View>
            </View>
          </ScrollView>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-bold">
              Recent Knowledge
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/notes")}>
              <Text className="text-indigo-400 text-xs font-semibold">
                Notes vault
              </Text>
            </TouchableOpacity>
          </View>

          {notes.slice(0, 2).map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/note/${note.id}`)}
              className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <FileText size={14} color="#F59E0B" />
                  <Text className="text-amber-400 text-xs font-medium">
                    {note.tags?.[0] || "#note"}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs">Recent</Text>
              </View>
              <Text className="text-white font-bold text-sm mb-1">
                {note.title}
              </Text>
              <Text
                className="text-gray-400 text-xs leading-relaxed"
                numberOfLines={2}
              >
                {note.content}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/calendar")}
          className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 mb-10 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-[#1F2738] rounded-xl px-2.5 py-1.5 items-center">
              <Text className="text-[10px] uppercase font-bold text-gray-400">
                OCT
              </Text>
              <Text className="text-base font-bold text-white">13</Text>
            </View>
            <View>
              <Text className="text-white text-sm font-semibold">
                Tomorrow, Oct 13
              </Text>
              <Text className="text-gray-400 text-xs">
                2 deep focus blocks scheduled
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
