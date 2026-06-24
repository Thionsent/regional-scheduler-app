import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Screen({ children, className = "" }) {
  return <View className={`flex-1 bg-[#F6F8FB] ${className}`}>{children}</View>;
}

export function SectionTitle({ eyebrow, title, action, onAction }) {
  return <View className="flex-row items-end justify-between mb-3"><View className="flex-1"><Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">{eyebrow}</Text><Text className="text-slate-950 text-xl font-black mt-1">{title}</Text></View>{action ? <TouchableOpacity onPress={onAction} className="px-3 py-2"><Text className="text-emerald-700 font-bold text-xs">{action}</Text></TouchableOpacity> : null}</View>;
}

export function EmptyState({ icon = "sparkles-outline", title, description, action, onAction }) {
  return <View className="bg-white border border-slate-100 rounded-[28px] px-7 py-9 items-center"><View className="h-12 w-12 rounded-2xl bg-emerald-50 items-center justify-center"><Ionicons name={icon} size={24} color="#059669" /></View><Text className="text-slate-950 font-black text-base mt-4 text-center">{title}</Text><Text className="text-slate-500 text-sm leading-5 mt-2 text-center">{description}</Text>{action ? <TouchableOpacity onPress={onAction} className="bg-slate-950 mt-5 px-5 py-3 rounded-xl"><Text className="text-white font-bold text-sm">{action}</Text></TouchableOpacity> : null}</View>;
}

export function PrimaryButton({ label, onPress, loading, disabled, icon }) {
  return <TouchableOpacity onPress={onPress} disabled={disabled || loading} className={`h-13 rounded-2xl flex-row justify-center items-center ${disabled ? "bg-slate-300" : "bg-emerald-500"}`}><>{loading ? <ActivityIndicator color="#06281f" /> : <>{icon ? <Ionicons name={icon} size={18} color="#06281f" /> : null}<Text className="text-emerald-950 font-black ml-2">{label}</Text></>}</></TouchableOpacity>;
}

export function StatusPill({ label, tone = "slate" }) {
  const styles = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700", slate: "bg-slate-100 text-slate-600" };
  return <View className={`self-start rounded-full px-2.5 py-1 ${styles[tone].split(" ")[0]}`}><Text className={`text-[10px] uppercase tracking-wide font-black ${styles[tone].split(" ")[1]}`}>{label}</Text></View>;
}
