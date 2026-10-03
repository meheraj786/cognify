import { Tabs, router } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import {
  Home,
  CheckSquare,
  Calendar,
  BookOpen,
  Plus,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#0E131F",
          borderTopColor: "#1E2638",
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-placeholder"
        options={{
          title: "",
          tabBarButton: () => (
            <View className="items-center justify-center -top-3">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/task/create")}
                className="w-13 h-13 rounded-full bg-[#6366F1] items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-[#0B0F17]"
                style={{ width: 52, height: 52, borderRadius: 26 }}
              >
                <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => <BookOpen size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
