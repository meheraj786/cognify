import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Inbox,
  MoreVertical,
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
import { Task } from "../../types";

export default function CalendarScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [viewMode, setViewMode] = useState<"Month" | "Week" | "Schedule">(
    "Month",
  );
  const [isUndatedExpanded, setIsUndatedExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Task[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Task);
      });
      setTasks(list);
    });

    return () => unsubscribe();
  }, [user]);

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const calendarDays = [
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, project: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true, done: true },
    { day: 4, isCurrentMonth: true, learning: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true, project: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true, done: true },
    { day: 11, isCurrentMonth: true, learning: true },
    {
      day: 12,
      isCurrentMonth: true,
      project: true,
      learning: true,
      done: true,
    },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true, project: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true, done: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true, learning: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true, project: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true, done: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true, project: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true, done: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
  ];

  const undatedTasks = useMemo(() => {
    return tasks.filter((t) => !t.dueDate);
  }, [tasks]);

  const scheduledTasks = useMemo(() => {
    return tasks.filter((t) => !!t.dueDate);
  }, [tasks]);

  const handleAssignToday = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, {
      dueDate: `Oct ${selectedDay}, 2024`,
      updatedAt: new Date().toISOString(),
    });
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
          <Text className="text-white text-lg font-bold">Calendar</Text>
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-4">
          <TouchableOpacity className="flex-row items-center gap-1.5">
            <Text className="text-white text-xl font-bold">October 2024</Text>
            <ChevronDown size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="bg-[#151922] px-3 py-1.5 rounded-lg border border-[#232936]">
              <Text className="text-white text-xs font-semibold">Today</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-8 h-8 rounded-lg bg-[#151922] border border-[#232936] items-center justify-center">
              <ChevronLeft size={16} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity className="w-8 h-8 rounded-lg bg-[#151922] border border-[#232936] items-center justify-center">
              <ChevronRight size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row bg-[#141A24] p-1 rounded-xl mb-4 border border-[#202838]">
          {(["Month", "Week", "Schedule"] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              className={`flex-1 py-1.5 rounded-lg items-center ${
                viewMode === mode ? "bg-[#222B3D]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  viewMode === mode ? "text-white" : "text-gray-400"
                }`}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-2 pb-2 border-b border-[#1E2536]">
            {daysOfWeek.map((day, idx) => (
              <View key={idx} className="w-9 items-center">
                <Text className="text-gray-500 text-xs font-semibold">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap justify-between">
            {calendarDays.map((item, idx) => {
              const isSelected =
                item.isCurrentMonth && item.day === selectedDay;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() =>
                    item.isCurrentMonth && setSelectedDay(item.day)
                  }
                  className={`w-9 h-11 items-center justify-center my-0.5 rounded-xl ${
                    isSelected
                      ? "bg-indigo-600/20 border border-indigo-500"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      !item.isCurrentMonth
                        ? "text-gray-700"
                        : isSelected
                          ? "text-indigo-400 font-bold"
                          : "text-gray-300"
                    }`}
                  >
                    {item.day}
                  </Text>

                  <View className="flex-row gap-0.5 mt-1 h-1 items-center">
                    {item.project && (
                      <View className="w-1 h-1 rounded-full bg-indigo-400" />
                    )}
                    {item.learning && (
                      <View className="w-1 h-1 rounded-full bg-amber-400" />
                    )}
                    {item.done && (
                      <View className="w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row items-center justify-center gap-5 pt-4 mt-2 border-t border-[#1E2536]">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-indigo-400" />
              <Text className="text-gray-400 text-xs">Project</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-amber-400" />
              <Text className="text-gray-400 text-xs">Learning</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-gray-400 text-xs">Done</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-white text-base font-bold">
              Thursday, October {selectedDay}
            </Text>
            <Text className="text-gray-400 text-xs">
              {scheduledTasks.length} Tasks scheduled
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/task/create")}
            className="flex-row items-center gap-1 bg-[#1E2535] px-3 py-1.5 rounded-xl border border-[#2B3548]"
          >
            <Plus size={14} color="#818CF8" />
            <Text className="text-indigo-400 text-xs font-semibold">
              Add Task
            </Text>
          </TouchableOpacity>
        </View>

        {scheduledTasks.length > 0 ? (
          scheduledTasks.map((t) => {
            const isLearning = t.category === "learning";
            const totalSub = t.subtasks?.length || 0;
            const completedSub =
              t.subtasks?.filter((s) => s.completed).length || 0;
            const percent =
              totalSub > 0
                ? Math.round((completedSub / totalSub) * 100)
                : t.isCompleted
                  ? 100
                  : 0;

            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/task/${t.id}`)}
                className="bg-[#141A24] border border-[#202838] rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text
                      className={`text-white text-sm font-bold ${t.isCompleted ? "line-through text-gray-500" : ""}`}
                    >
                      {t.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      <View
                        className={`px-2 py-0.5 rounded-md ${
                          isLearning ? "bg-amber-500/10" : "bg-indigo-500/10"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold uppercase ${
                            isLearning ? "text-amber-400" : "text-indigo-400"
                          }`}
                        >
                          {t.category}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Clock size={11} color="#94A3B8" />
                        <Text className="text-gray-400 text-[11px]">
                          {t.dueDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity className="p-1">
                    <MoreVertical size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {totalSub > 0 && (
                  <View className="mt-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400 text-[11px]">
                        Subtasks: {completedSub}/{totalSub}
                      </Text>
                      <Text className="text-gray-300 text-[11px] font-bold">
                        {percent}%
                      </Text>
                    </View>
                    <View className="h-1.5 w-full bg-[#1F2738] rounded-full overflow-hidden">
                      <View
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          percent === 100
                            ? "bg-emerald-500"
                            : isLearning
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                        }`}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="bg-[#141A24] border border-[#202838] rounded-2xl p-6 items-center justify-center mb-4">
            <Text className="text-gray-400 text-xs">
              No tasks scheduled for this day.
            </Text>
          </View>
        )}

        <View className="bg-[#141A24] border border-[#202838] rounded-2xl overflow-hidden mb-12">
          <TouchableOpacity
            onPress={() => setIsUndatedExpanded(!isUndatedExpanded)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-[#1C2333] items-center justify-center">
                <Inbox size={16} color="#818CF8" />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-white text-sm font-bold">
                    Undated Tasks
                  </Text>
                  <View className="bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <Text className="text-indigo-400 text-[10px] font-bold">
                      {undatedTasks.length}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-[11px]">
                  Tasks with no deadline set
                </Text>
              </View>
            </View>
            <ChevronDown
              size={18}
              color="#64748B"
              style={{
                transform: [{ rotate: isUndatedExpanded ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>

          {isUndatedExpanded && (
            <View className="px-4 pb-4 border-t border-[#1C2333] pt-3">
              {undatedTasks.length > 0 ? (
                undatedTasks.map((ut) => (
                  <View
                    key={ut.id}
                    className="flex-row items-center justify-between py-2.5 border-b border-[#1E2536] last:border-b-0"
                  >
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-white text-xs font-semibold"
                        numberOfLines={1}
                      >
                        {ut.title}
                      </Text>
                      <Text className="text-amber-400 text-[10px] uppercase font-bold mt-0.5">
                        {ut.category}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleAssignToday(ut.id)}
                      className="flex-row items-center gap-1 bg-[#1C2333] px-2.5 py-1.5 rounded-lg border border-[#2B3548]"
                    >
                      <CalendarIcon size={11} color="#94A3B8" />
                      <Text className="text-gray-300 text-[11px] font-medium">
                        Assign
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 text-xs py-2 text-center">
                  No undated tasks available.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
