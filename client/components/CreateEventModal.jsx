import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateEventModal({ visible, onClose, onSave, defaultDate }) {
  const [title, setTitle] = useState(""); const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date()); const [showPicker, setShowPicker] = useState(null); const [saving, setSaving] = useState(false);
  useEffect(() => { if (visible && defaultDate) { const next = new Date(defaultDate); next.setHours(9, 0, 0, 0); setDate(next); } }, [visible, defaultDate]);
  const save = async () => {
    if (!title.trim()) return alert("Please enter an event title.");
    setSaving(true);
    try { await onSave({ title: title.trim(), location: location.trim() || undefined, startTime: date.toISOString(), endTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Nairobi" }); setTitle(""); setLocation(""); onClose(); }
    finally { setSaving(false); }
  };
  const change = (_event, value) => { setShowPicker(null); if (value) setDate(value); };
  return <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-slate-950/70">
      <View className="bg-slate-900 rounded-t-3xl p-6">
        <Text className="text-white text-xl font-black mb-6">Create event</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="What are you scheduling?" placeholderTextColor="#64748b" className="bg-slate-800 text-white p-4 rounded-xl mb-3" />
        <TextInput value={location} onChangeText={setLocation} placeholder="Location or meeting link (optional)" placeholderTextColor="#64748b" className="bg-slate-800 text-white p-4 rounded-xl mb-3" />
        <View className="flex-row gap-3 mb-4"><TouchableOpacity onPress={() => setShowPicker("date")} className="flex-1 bg-slate-800 p-4 rounded-xl"><Text className="text-slate-400 text-xs">DATE</Text><Text className="text-white font-bold">{date.toLocaleDateString()}</Text></TouchableOpacity><TouchableOpacity onPress={() => setShowPicker("time")} className="flex-1 bg-slate-800 p-4 rounded-xl"><Text className="text-slate-400 text-xs">TIME</Text><Text className="text-white font-bold">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text></TouchableOpacity></View>
        {showPicker && <DateTimePicker value={date} mode={showPicker} onChange={change} />}
        <View className="flex-row gap-3"><TouchableOpacity onPress={onClose} className="flex-1 bg-slate-800 p-4 rounded-xl items-center"><Text className="text-white font-bold">Cancel</Text></TouchableOpacity><TouchableOpacity onPress={save} disabled={saving} className="flex-1 bg-emerald-400 p-4 rounded-xl items-center"><Text className="text-slate-950 font-black">{saving ? "Saving..." : "Save event"}</Text></TouchableOpacity></View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
