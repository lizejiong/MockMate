import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useTheme } from "@/theme/useTheme";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="interview"
        options={{
          title: "面试",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "历史",
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "我的",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
