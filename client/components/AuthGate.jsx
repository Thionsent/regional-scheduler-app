import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import { persistSession } from "../lib/session";

export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState(""); const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState(""); const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const complete = async (session) => { await persistSession(session); onAuthenticated(session.user); };
  const submit = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "login") await complete(await api.auth.login({ phoneNumber, password }));
      else if (mode === "register") await complete(await api.auth.register({ name, phoneNumber, password }));
      else if (mode === "otp") { await api.auth.requestOtp({ phoneNumber }); setMessage("Code sent. In local development, check the API terminal."); setMode("otpVerify"); }
      else if (mode === "otpVerify") await complete(await api.auth.verifyOtp({ phoneNumber, code, name: name || undefined }));
      else if (mode === "reset") { await api.auth.requestPasswordReset({ phoneNumber }); setMessage("If that account exists, a reset code was sent."); setMode("resetConfirm"); }
      else if (mode === "resetConfirm") { await api.auth.confirmPasswordReset({ phoneNumber, code, newPassword: password }); setMessage("Password changed. Sign in with your new password."); setMode("login"); }
    } catch (reason) { setError(reason.message === "INVALID_CREDENTIALS" ? "Phone number or password is incorrect." : reason.message); }
    finally { setLoading(false); }
  };
  const isRegister = mode === "register"; const needsPassword = ["login", "register", "resetConfirm"].includes(mode);
  const needsCode = ["otpVerify", "resetConfirm"].includes(mode);
  const actionLabel = { login: "Sign in", register: "Create account", otp: "Send sign-in code", otpVerify: "Verify and sign in", reset: "Send reset code", resetConfirm: "Set new password" }[mode];
  const Input = ({ icon, children }) => <View className="flex-row items-center bg-slate-800 rounded-2xl px-4 mb-3 border border-slate-700"><Ionicons name={icon} size={18} color="#94a3b8" />{children}</View>;
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-slate-950"><ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12"><View className="h-12 w-12 rounded-2xl bg-emerald-500 items-center justify-center mb-7"><Ionicons name="calendar" size={23} color="#06281f" /></View><Text className="text-emerald-300 font-black text-[10px] uppercase tracking-[3px]">Regional Scheduler</Text><Text className="text-white text-4xl font-black mt-2">Own your time.</Text><Text className="text-slate-400 mt-3 mb-8 leading-5">A calm place for personal plans, shared schedules, and WhatsApp-powered coordination.</Text>
    <View className="bg-slate-900 rounded-[28px] p-5 border border-slate-800">{isRegister && <Input icon="person-outline"><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#64748b" className="flex-1 text-white p-4" /></Input>}{mode === "otpVerify" && <Input icon="person-outline"><TextInput value={name} onChangeText={setName} placeholder="Your name (new accounts)" placeholderTextColor="#64748b" className="flex-1 text-white p-4" /></Input>}<Input icon="call-outline"><TextInput value={phoneNumber} onChangeText={setPhoneNumber} autoCapitalize="none" keyboardType="phone-pad" placeholder="Phone number, e.g. +2547..." placeholderTextColor="#64748b" className="flex-1 text-white p-4" /></Input>{needsCode && <Input icon="keypad-outline"><TextInput value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="6-digit code" placeholderTextColor="#64748b" className="flex-1 text-white p-4 tracking-[6px]" /></Input>}{needsPassword && <Input icon="lock-closed-outline"><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder={mode === "resetConfirm" ? "New password (8+ characters)" : "Password (8+ characters)"} placeholderTextColor="#64748b" className="flex-1 text-white p-4" /></Input>}{!!error && <Text className="text-rose-300 text-sm mb-3">{error}</Text>}{!!message && <Text className="text-emerald-300 text-sm mb-3">{message}</Text>}<TouchableOpacity onPress={submit} disabled={loading} className="bg-emerald-500 h-14 rounded-2xl items-center justify-center mt-1">{loading ? <ActivityIndicator color="#06281f" /> : <Text className="text-emerald-950 font-black">{actionLabel}</Text>}</TouchableOpacity></View>
    <TouchableOpacity onPress={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); setError(""); }} className="pt-6 items-center"><Text className="text-slate-300">{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</Text></TouchableOpacity><View className="flex-row justify-center gap-5 pt-4"><TouchableOpacity onPress={() => { setMode("otp"); setMessage(""); setError(""); }}><Text className="text-emerald-300 text-xs font-bold">Use phone code</Text></TouchableOpacity><TouchableOpacity onPress={() => { setMode("reset"); setMessage(""); setError(""); }}><Text className="text-emerald-300 text-xs font-bold">Reset password</Text></TouchableOpacity></View></ScrollView></KeyboardAvoidingView>;
}
