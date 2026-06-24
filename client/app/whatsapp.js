import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState, Screen, SectionTitle, StatusPill } from "../components/ui";

function ChatBubble({ name, mine, children }) {
  return <View className="flex-row"><View className={`h-9 w-9 rounded-full items-center justify-center ${mine ? "bg-emerald-100" : "bg-slate-900"}`}><Ionicons name={mine ? "chatbubble-outline" : "sparkles"} size={17} color={mine ? "#047857" : "#6ee7b7"} /></View><View className="ml-3 flex-1"><Text className="text-slate-800 font-bold">{name}</Text><View className={`rounded-2xl rounded-tl-sm p-3 mt-2 ${mine ? "bg-slate-100" : "bg-emerald-50"}`}><Text className={`${mine ? "text-slate-700" : "text-emerald-900"} text-sm leading-5`}>{children}</Text></View></View></View>;
}

export default function WhatsAppScreen() {
  return <Screen><ScrollView contentContainerClassName="pb-10"><View className="bg-slate-950 px-5 pt-16 pb-10 rounded-b-[36px]"><View className="flex-row justify-between items-center"><View><Text className="text-emerald-300 text-[10px] font-black tracking-[2px] uppercase">Concierge scheduling</Text><Text className="text-white text-3xl font-black mt-2">WhatsApp</Text></View><View className="h-12 w-12 rounded-2xl bg-white/10 items-center justify-center"><Ionicons name="logo-whatsapp" size={25} color="#6ee7b7" /></View></View><Text className="text-slate-300 mt-3 leading-5">Create and manage your calendar in the conversation you already use every day.</Text></View>
    <View className="px-4 -mt-4"><View className="bg-white rounded-[28px] p-5 border border-slate-100"><View className="flex-row justify-between items-center"><View><Text className="text-slate-950 font-black">WhatsApp connection</Text><Text className="text-slate-500 text-xs mt-1">Connect before enabling messages</Text></View><StatusPill label="Coming soon" tone="amber" /></View><TouchableOpacity className="bg-emerald-500 rounded-2xl py-4 mt-5 items-center"><Text className="text-emerald-950 font-black">Connect WhatsApp</Text></TouchableOpacity></View>
      <View className="mt-8"><SectionTitle eyebrow="How it works" title="Just message naturally" /><View className="bg-white rounded-[28px] p-5 border border-slate-100"><ChatBubble name="You" mine>“Schedule a meeting with Jane tomorrow at 5pm.”</ChatBubble><View className="border-l-2 border-dashed border-slate-200 h-6 ml-4 my-2" /><ChatBubble name="Regional Scheduler">Done — “Meeting with Jane” is on your calendar for tomorrow, 5:00 PM.</ChatBubble></View></View>
    </View><View className="px-4 mt-6"><EmptyState icon="shield-checkmark-outline" title="Your calendar, your control" description="You will be able to choose which conversations may add or update schedule items." /></View></ScrollView></Screen>;
}
