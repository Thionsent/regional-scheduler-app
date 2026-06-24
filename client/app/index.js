import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthGate from "../components/AuthGate";
import CreateEventModal from "../components/CreateEventModal";
import { api, getAccessToken } from "../lib/api";
import { restoreSession } from "../lib/session";

const dayStart = (value) => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; };
const rollingDays = () => Array.from({ length: 7 }, (_, index) => { const date = dayStart(new Date()); date.setDate(date.getDate() + index); return date; });

export default function DashboardScreen() {
  const days = useMemo(rollingDays, []); const [selectedDate, setSelectedDate] = useState(days[0]);
  const [events, setEvents] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); const [user, setUser] = useState(null); const [restoring, setRestoring] = useState(true);
  useEffect(() => { restoreSession().then(setUser).finally(() => setRestoring(false)); }, []);
  const loadEvents = async () => {
    if (!getAccessToken()) return;
    setLoading(true);
    try { const next = new Date(selectedDate); next.setDate(next.getDate() + 1); setEvents(await api.events.list({ from: selectedDate.toISOString(), to: next.toISOString(), q: query || undefined })); }
    catch (error) { Alert.alert("Could not load events", error.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadEvents(); }, [selectedDate, user]);
  const saveEvent = async (input) => { try { await api.events.create(input); await loadEvents(); } catch (error) { Alert.alert("Could not save event", error.message); throw error; } };
  if (restoring) return <View className="flex-1 items-center justify-center bg-slate-950"><ActivityIndicator color="#34d399" /></View>;
  if (!user) return <AuthGate onAuthenticated={setUser} />;
  return <View className="flex-1 bg-slate-50"><StatusBar barStyle="light-content" backgroundColor="#0284c7" />
    <View className="bg-sky-600 px-5 pt-5 pb-12 rounded-b-[36px]"><Text className="text-sky-100 text-xs font-bold uppercase tracking-widest">{user.name}'s workspace</Text><Text className="text-white text-2xl font-black mt-1">Today, deliberately.</Text><View className="bg-white/15 mt-5 rounded-2xl p-5"><Text className="text-amber-300 text-xs font-black uppercase">{selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Text><Text className="text-white text-4xl font-black mt-2">{events.length}</Text><Text className="text-sky-100 text-xs font-bold uppercase">Scheduled items</Text></View></View>
    <View className="bg-white mx-4 -mt-6 rounded-2xl p-3 shadow-sm"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">{days.map((day) => { const active = day.getTime() === selectedDate.getTime(); return <TouchableOpacity key={day.toISOString()} onPress={() => setSelectedDate(day)} className={`w-12 p-2 rounded-xl items-center ${active ? "bg-sky-500" : "bg-slate-50"}`}><Text className={`text-[10px] font-bold ${active ? "text-white" : "text-slate-400"}`}>{day.toLocaleDateString(undefined, { weekday: "short" })}</Text><Text className={`font-black ${active ? "text-white" : "text-slate-700"}`}>{day.getDate()}</Text></TouchableOpacity>; })}</ScrollView></View>
    <View className="mx-4 mt-5 flex-row bg-white rounded-xl border border-slate-200 px-3 items-center"><Ionicons name="search" size={16} color="#94a3b8" /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={loadEvents} placeholder="Search this day" placeholderTextColor="#94a3b8" className="flex-1 p-3 text-slate-800" /></View>
    <ScrollView className="flex-1 px-4 mt-4">{loading ? <ActivityIndicator color="#0284c7" className="mt-12" /> : events.length ? events.map((event) => <TouchableOpacity key={event.id} onLongPress={() => Alert.alert(event.title, "Delete this event?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await api.events.remove(event.id); loadEvents(); } }])} className="bg-white border border-slate-100 rounded-2xl p-4 mb-3"><Text className="text-slate-900 text-base font-black">{event.title}</Text><View className="flex-row justify-between mt-3"><Text className="text-slate-500">{new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text><Text className="text-slate-400" numberOfLines={1}>{event.location || "No location"}</Text></View></TouchableOpacity>) : <View className="mt-12 items-center"><Ionicons name="calendar-outline" size={40} color="#cbd5e1" /><Text className="text-slate-400 mt-3">A clear day. Add something meaningful.</Text></View>}<View className="h-24" /></ScrollView>
    <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute right-6 bottom-6 h-14 w-14 rounded-full items-center justify-center bg-rose-500"><Ionicons name="add" size={28} color="white" /></TouchableOpacity>
    <CreateEventModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={saveEvent} defaultDate={selectedDate.toISOString()} />
  </View>;
}
