import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, StatusBar } from "react-native";

// Generates a rolling list of the next 7 days from today
const getRollingWeek = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const today = new Date();
    today.setDate(today.getDate() + i);
    days.push({
      dayName: today.toLocaleDateString("en-US", { weekday: "short" }), // e.g., Mon, Tue
      dayNumber: today.getDate(),                                      // e.g., 11, 12
      fullDate: today.toDateString(),                                  // Match identifier
    });
  }
  return days;
};

// Mock data structured exactly like your Supabase/Prisma schemas
const MOCK_EVENTS = [
  {
    id: "1",
    title: "Project Sync: Talomart Stores",
    time: "09:00 AM - 10:30 AM",
    location: "Google Meet",
    isChamaMeeting: false,
    fullDate: new Date().toDateString(), // Scheduled for today
  },
  {
    id: "2",
    title: "Chama Monthly Contribution Meeting",
    time: "04:00 PM - 05:30 PM",
    location: "Mombasa Road Hub / WhatsApp",
    isChamaMeeting: true, // Triggers Chama design accent
    fullDate: new Date().toDateString(), // Scheduled for today
  },
  {
    id: "3",
    title: "Network Security Audit & Backup",
    time: "11:00 AM - 01:00 PM",
    location: "Local Server Environment",
    isChamaMeeting: false,
    fullDate: new Date(new Date().setDate(new Date().getDate() + 1)).toDateString(), // Scheduled for tomorrow
  },
];

export default function DashboardScreen() {
  const weekDays = getRollingWeek();
  const [selectedDate, setSelectedDate] = useState(weekDays[0].fullDate);

  // Filter events belonging only to the highlighted day
  const filteredEvents = MOCK_EVENTS.filter(event => event.fullDate === selectedDate);

  return (
    <View className="flex-1 bg-slate-950 px-4 pt-4">
      <StatusBar barStyle="light-content" />

      {/* Profile/Greeting Section */}
      <View className="mb-6 mt-2">
        <Text className="text-slate-400 text-sm font-medium">Welcome back,</Text>
        <Text className="text-white text-3xl font-black tracking-tight">Edward 👋</Text>
      </View>

      {/* Rolling Weekly Grid Header */}
      <View className="mb-4">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
          Weekly Timeline
        </Text>
        
        <View className="flex-row justify-between bg-slate-900 p-2 rounded-2xl border border-slate-800/80">
          {weekDays.map((day, idx) => {
            const isSelected = selectedDate === day.fullDate;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedDate(day.fullDate)}
                activeOpacity={0.7}
                // Cleared transition-all and shadow-md to solve the internal navigation context exception
                className={`items-center justify-center w-11 py-3 rounded-xl ${
                  isSelected ? "bg-emerald-500" : "bg-transparent"
                }`}
                // Safe native style object prevents NativeWind v4 multi-thread state collisions
                style={isSelected ? {
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 5,
                  elevation: 4, // Clean rendering projection for Android hardware
                } : null}
              >
                <Text className={`text-xs font-bold mb-1 ${isSelected ? "text-slate-950" : "text-slate-500"}`}>
                  {day.dayName}
                </Text>
                <Text className={`text-base font-black ${isSelected ? "text-slate-950" : "text-white"}`}>
                  {day.dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Events Stream Feed */}
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 mt-2">
        Agenda Schedule
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {filteredEvents.length === 0 ? (
          <View className="items-center justify-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Text className="text-slate-500 text-sm font-medium">No events scheduled for this day</Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <View 
              key={event.id} 
              className={`p-5 mb-4 rounded-2xl border bg-slate-900 ${
                event.isChamaMeeting ? "border-emerald-500/30 border-l-4 border-l-emerald-500" : "border-slate-800"
              }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white text-lg font-bold flex-1 pr-2 leading-snug">
                  {event.title}
                </Text>
                {event.isChamaMeeting && (
                  <View className="bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      Chama
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-slate-400 text-sm font-semibold mb-1">
                ⏱️ {event.time}
              </Text>
              
              {event.location && (
                <Text className="text-slate-500 text-xs font-medium">
                  📍 {event.location}
                </Text>
              )}
            </View>
          ))
        )}
        {/* Extra padding spacer for bottom scroll visibility */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}