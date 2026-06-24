import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthGate from "../components/AuthGate";
import CreateEventModal from "../components/CreateEventModal";
import { api, getAccessToken } from "../lib/api";
import { restoreSession } from "../lib/session";
import { EmptyState, StatusPill } from "../components/ui";

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
  return <View className="flex-1 bg-[#F6F8FB]"><StatusBar barStyle="light-content" backgroundColor="#052e25" />
    <View className="bg-emerald-950 px-5 pt-14 pb-12 rounded-b-[36px]"><View className="flex-row justify-between items-start"><View><Text className="text-emerald-300 text-[10px] font-black uppercase tracking-[2px]">{user.name}'s workspace</Text><Text className="text-white text-3xl font-black mt-2">Today, deliberately.</Text></View><TouchableOpacity onPress={loadEvents} className="h-10 w-10 rounded-xl bg-white/10 items-center justify-center"><Ionicons name="refresh" size={18} color="#d1fae5" /></TouchableOpacity></View><View className="bg-white/10 mt-6 rounded-[24px] p-5 flex-row items-end justify-between"><View><Text className="text-amber-300 text-[10px] font-black uppercase tracking-[1.5px]">{selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Text><Text className="text-white text-4xl font-black mt-2">{events.length}</Text><Text className="text-emerald-100 text-xs font-bold mt-1">scheduled {events.length === 1 ? "item" : "items"}</Text></View><StatusPill label={selectedDate.toDateString() === new Date().toDateString() ? "Today" : "Selected day"} tone="emerald" /></View></View>
    <View className="bg-white mx-4 -mt-6 rounded-2xl p-3 border border-slate-100"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">{days.map((day) => { const active = day.getTime() === selectedDate.getTime(); return <TouchableOpacity key={day.toISOString()} onPress={() => setSelectedDate(day)} className={`w-12 p-2.5 rounded-xl items-center ${active ? "bg-emerald-500" : "bg-slate-50"}`}><Text className={`text-[10px] font-bold ${active ? "text-emerald-950" : "text-slate-400"}`}>{day.toLocaleDateString(undefined, { weekday: "short" })}</Text><Text className={`font-black mt-1 ${active ? "text-emerald-950" : "text-slate-700"}`}>{day.getDate()}</Text></TouchableOpacity>; })}</ScrollView></View>
    <View className="mx-4 mt-5 flex-row bg-white rounded-2xl border border-slate-200 px-4 items-center"><Ionicons name="search" size={16} color="#94a3b8" /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={loadEvents} placeholder="Search this day" placeholderTextColor="#94a3b8" className="flex-1 p-4 text-slate-800" /></View>
    <ScrollView className="flex-1 px-4 mt-5">{loading ? <ActivityIndicator color="#059669" className="mt-12" /> : events.length ? events.map((event) => <TouchableOpacity key={event.id} onPress={() => Alert.alert(event.title, `${new Date(event.startTime).toLocaleString()}${event.location ? `\n${event.location}` : ""}`, [{ text: "Close", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await api.events.remove(event.id); loadEvents(); } }])} className="bg-white border border-slate-100 rounded-[24px] p-5 mb-3"><View className="flex-row justify-between"><View className="flex-1"><Text className="text-slate-950 text-base font-black">{event.title}</Text><Text className="text-slate-500 text-xs mt-2">{new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {event.location || "No location"}</Text></View><View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center"><Ionicons name="chevron-forward" size={17} color="#047857" /></View></View></TouchableOpacity>) : <View className="mt-7"><EmptyState icon="calendar-outline" title="A clear day, by design" description="Add a plan when it matters. Your day has room to breathe." action="Create an event" onAction={() => setModalVisible(true)} /></View>}<View className="h-28" /></ScrollView>
    <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute right-6 bottom-6 h-14 px-5 rounded-full flex-row items-center justify-center bg-emerald-500 shadow-lg"><Ionicons name="add" size={23} color="#06281f" /><Text className="text-emerald-950 font-black ml-1">Add</Text></TouchableOpacity>
    <CreateEventModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={saveEvent} defaultDate={selectedDate.toISOString()} />
  </View>;
}
