import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  return <View className="flex-1 bg-slate-950 justify-center px-6"><Text className="text-emerald-400 font-black text-xs uppercase tracking-[3px]">Regional Scheduler</Text><Text className="text-white text-4xl font-black mt-2">Own your time.</Text><Text className="text-slate-400 mt-2 mb-8">Schedule personally, coordinate collectively, and manage it from WhatsApp.</Text>
    {isRegister && <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#94a3b8" className="bg-slate-900 text-white rounded-xl p-4 mb-3" />}
    {mode === "otpVerify" && <TextInput value={name} onChangeText={setName} placeholder="Your name (new accounts)" placeholderTextColor="#94a3b8" className="bg-slate-900 text-white rounded-xl p-4 mb-3" />}
    <TextInput value={phoneNumber} onChangeText={setPhoneNumber} autoCapitalize="none" keyboardType="phone-pad" placeholder="Phone number, e.g. +2547..." placeholderTextColor="#94a3b8" className="bg-slate-900 text-white rounded-xl p-4 mb-3" />
    {needsCode && <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="6-digit code" placeholderTextColor="#94a3b8" className="bg-slate-900 text-white rounded-xl p-4 mb-3" />}
    {needsPassword && <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder={mode === "resetConfirm" ? "New password (8+ characters)" : "Password (8+ characters)"} placeholderTextColor="#94a3b8" className="bg-slate-900 text-white rounded-xl p-4 mb-3" />}
    {!!error && <Text className="text-rose-300 text-sm mb-3">{error}</Text>}{!!message && <Text className="text-emerald-300 text-sm mb-3">{message}</Text>}
    <TouchableOpacity onPress={submit} disabled={loading} className="bg-emerald-400 p-4 rounded-xl items-center">{loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-slate-950 font-black">{{ login: "Sign in", register: "Create account", otp: "Send sign-in code", otpVerify: "Verify and sign in", reset: "Send reset code", resetConfirm: "Set new password" }[mode]}</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); setError(""); }} className="pt-5 items-center"><Text className="text-slate-300">{mode === "login" ? "New here? Create an account" : "Use password sign-in"}</Text></TouchableOpacity>
    <View className="flex-row justify-center gap-4 pt-3"><TouchableOpacity onPress={() => { setMode("otp"); setMessage(""); setError(""); }}><Text className="text-sky-300 text-xs font-bold">Use phone code</Text></TouchableOpacity><TouchableOpacity onPress={() => { setMode("reset"); setMessage(""); setError(""); }}><Text className="text-sky-300 text-xs font-bold">Reset password</Text></TouchableOpacity></View>
  </View>;
}
