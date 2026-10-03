import React, { useEffect, useState, useMemo } from "react";
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
  Plus,
  SlidersHorizontal,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  TrendingUp,
  Edit3,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { Task, TaskCategory } from "../../types";
import { TaskCard } from "../../components/TaskCard";

export default function TasksScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "all" | "project" | "learning" | "active"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, "users", user.uid, "tasks"));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const list: Task[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Task);
      });
      setTasks(list);
    });

    return () => unsubscribe();
  }, [user]);

  const projectCount = useMemo(
    () => tasks.filter((t) => t.category === "project").length,
    [tasks],
  );
  const learningCount = useMemo(
    () => tasks.filter((t) => t.category === "learning").length,
    [tasks],
  );
  const activeCount = useMemo(
    () => tasks.filter((t) => !t.isCompleted).length,
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "project") return task.category === "project";
      if (filter === "learning") return task.category === "learning";
      if (filter === "active") return !task.isCompleted;
      return true;
    });
  }, [tasks, filter]);

  const handleToggleTask = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, {
      isCompleted: !task.isCompleted,
      progress: !task.isCompleted ? 100 : task.progress,
      updatedAt: new Date().toISOString(),
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
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
          <Text className="text-white text-lg font-bold">Tasks</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-9 h-9 rounded-full bg-[#161B26] items-center justify-center">
            <Search size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
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

      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-2xl font-extrabold">
              Active Sprints
            </Text>
            <View className="bg-[#21293B] px-2.5 py-0.5 rounded-full">
              <Text className="text-indigo-400 text-xs font-bold">
                {tasks.length}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-9 h-9 rounded-xl bg-[#161B26] border border-[#232B3A] items-center justify-center">
              <SlidersHorizontal size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/task/create")}
              className="flex-row items-center gap-1.5 bg-[#6366F1] px-3.5 py-2 rounded-xl"
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white text-xs font-bold">New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 px-5 mb-4"
        >
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full mr-2 border ${
              filter === "all"
                ? "bg-[#6366F1]/20 border-[#6366F1]"
                : "bg-[#151922] border-[#222836]"
            }`}
          >
            <Text
              className={`text-xs font-bold ${filter === "all" ? "text-indigo-300" : "text-gray-400"}`}
            >
              All ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("project")}
            className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full mr-2 border ${
              filter === "project"
                ? "bg-indigo-500/20 border-indigo-500"
                : "bg-[#151922] border-[#222836]"
            }`}
          >
            <View className="w-2 h-2 rounded-full bg-indigo-400" />
            <Text
              className={`text-xs font-bold ${filter === "project" ? "text-indigo-300" : "text-gray-400"}`}
            >
              Project ({projectCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("learning")}
            className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full mr-2 border ${
              filter === "learning"
                ? "bg-amber-500/20 border-amber-500"
                : "bg-[#151922] border-[#222836]"
            }`}
          >
            <View className="w-2 h-2 rounded-full bg-amber-400" />
            <Text
              className={`text-xs font-bold ${filter === "learning" ? "text-amber-300" : "text-gray-400"}`}
            >
              Learning ({learningCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-full mr-2 border ${
              filter === "active"
                ? "bg-emerald-500/20 border-emerald-500"
                : "bg-[#151922] border-[#222836]"
            }`}
          >
            <Text
              className={`text-xs font-bold ${filter === "active" ? "text-emerald-300" : "text-gray-400"}`}
            >
              Active ({activeCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row items-center justify-between pb-3">
          <View className="flex-row items-center gap-1">
            <Text className="text-gray-400 text-xs">Sort by:</Text>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-white text-xs font-semibold">Due Date</Text>
              <ChevronDown size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-1 bg-[#151922] p-1 rounded-lg border border-[#232936]">
            <TouchableOpacity className="p-1 rounded bg-[#202737]">
              <LayoutList size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity className="p-1">
              <LayoutGrid size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
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
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleTask}
            />
          ))
        ) : (
          <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-8 items-center justify-center my-6">
            <Text className="text-gray-400 text-sm">
              No tasks matching current filter.
            </Text>
          </View>
        )}

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 my-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20">
            <TrendingUp size={20} color="#818CF8" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">
              Velocity Streak: 6 Days
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              You&apos;re completing 82% of assigned subtasks on time.
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/task/create")}
        className="absolute bottom-6 right-5 w-12 h-12 rounded-2xl bg-[#6366F1] items-center justify-center shadow-lg shadow-indigo-500/40"
      >
        <Edit3 size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
