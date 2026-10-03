import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Paperclip,
  Clock,
} from "lucide-react-native";
import { Task } from "../types";
import { router } from "expo-router";

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
}) => {
  const isLearning = task.category === "learning";
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed).length || 0;

  const progressPercent =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : task.isCompleted
        ? 100
        : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/task/${task.id}`)}
      className="bg-[#151922] border border-[#232936] rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-wrap">
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
            <View className="flex-row items-center gap-1">
              <View
                className={`w-1.5 h-1.5 rounded-full ${
                  task.priority === "high"
                    ? "bg-rose-500"
                    : task.priority === "medium"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <Text className="text-xs text-gray-400 capitalize">
                {task.priority}
              </Text>
            </View>
          )}

          {task.dueDate ? (
            <View className="flex-row items-center gap-1 bg-[#1E2430] px-2 py-0.5 rounded-md">
              <Clock size={11} color="#9CA3AF" />
              <Text className="text-[11px] text-gray-300">{task.dueDate}</Text>
            </View>
          ) : (
            <Text className="text-[11px] text-gray-500">No deadline</Text>
          )}
        </View>

        {progressPercent === 100 && (
          <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <CheckCircle2 size={12} color="#10B981" />
            <Text className="text-emerald-400 text-[11px] font-medium">
              All done
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-start gap-3 mb-3">
        {onToggleComplete && (
          <TouchableOpacity
            onPress={() => onToggleComplete(task.id)}
            className={`w-5 h-5 rounded-md border mt-0.5 items-center justify-center ${
              task.isCompleted
                ? "bg-emerald-500 border-emerald-500"
                : "border-gray-600 bg-transparent"
            }`}
          >
            {task.isCompleted && <CheckCircle2 size={14} color="#FFFFFF" />}
          </TouchableOpacity>
        )}

        <View className="flex-1">
          <Text
            className={`text-white text-base font-semibold leading-snug ${
              task.isCompleted ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </Text>
        </View>

        {task.attachments &&
          task.attachments.length > 0 &&
          task.attachments[0].type === "image" && (
            <Image
              source={{ uri: task.attachments[0].url }}
              className="w-12 h-12 rounded-lg bg-gray-800"
              resizeMode="cover"
            />
          )}
      </View>

      {totalSubtasks > 0 && (
        <View className="mt-1">
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-xs text-gray-400">
              {completedSubtasks} / {totalSubtasks} subtasks
            </Text>
            <Text className="text-xs font-semibold text-gray-300">
              {progressPercent}%
            </Text>
          </View>

          <View className="h-1.5 w-full bg-[#202736] rounded-full overflow-hidden">
            <View
              style={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full ${
                progressPercent === 100
                  ? "bg-emerald-500"
                  : isLearning
                    ? "bg-amber-500"
                    : "bg-indigo-500"
              }`}
            />
          </View>
        </View>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <View className="flex-row items-center gap-3 pt-3 mt-3 border-t border-[#1F2633]">
          <View className="flex-row items-center gap-1">
            <Paperclip size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">
              {task.attachments.length} attachment
              {task.attachments.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
