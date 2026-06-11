import React from "react";
import { Text, View } from "react-native";

export default function ChamaFeedScreen() {
  return (
    <View className="flex-1 bg-slate-950 p-6">
      <Text className="text-white text-2xl font-black mb-2">Chama Hub</Text>
      <Text className="text-slate-400 text-sm">
        Shared schedules, group meeting notifications, and RSVPs will appear here.
      </Text>
    </View>
  );
}