import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { api, setAccessToken } from "./api";

const SESSION_KEY = "regional-scheduler.session.v1";

async function readStoredSession() {
  const raw = Platform.OS === "web" ? globalThis.sessionStorage?.getItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function writeStoredSession(value) {
  const raw = JSON.stringify(value);
  if (Platform.OS === "web") globalThis.sessionStorage?.setItem(SESSION_KEY, raw);
  else await SecureStore.setItemAsync(SESSION_KEY, raw, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

async function removeStoredSession() {
  if (Platform.OS === "web") globalThis.sessionStorage?.removeItem(SESSION_KEY);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function persistSession(session) {
  setAccessToken(session.accessToken);
  await writeStoredSession({ refreshToken: session.refreshToken, user: session.user });
  return session.user;
}

export async function restoreSession() {
  const stored = await readStoredSession();
  if (!stored?.refreshToken) return null;
  try {
    const session = await api.auth.refresh({ refreshToken: stored.refreshToken });
    return persistSession(session);
  } catch {
    await removeStoredSession();
    setAccessToken(null);
    return null;
  }
}

export async function clearSession() {
  const stored = await readStoredSession();
  try { if (stored?.refreshToken) await api.auth.logout({ refreshToken: stored.refreshToken }); } catch { /* token may already be revoked */ }
  await removeStoredSession();
  setAccessToken(null);
}
