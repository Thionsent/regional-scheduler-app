import "../global.css";
import { Tabs } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' }, // slate-900
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 0 },
        tabBarActiveTintColor: '#34d399', // emerald-400
        tabBarInactiveTintColor: '#94a3b8', // slate-400
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="chama"
        options={{
          title: "Chama Feed",
        }}
      />
    </Tabs>
  );
}