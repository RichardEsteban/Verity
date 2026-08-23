"use client";

import type { User } from "./types";
import { request } from "./backend";

const TOKEN_KEY = "verify_token";
const USER_KEY = "verify_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function login(whatsapp_number: string, display_name: string) {
  const auth = await request<{ token: string; user_id: string; created: boolean }>("/api/auth/whatsapp", {
    method: "POST",
    body: { whatsapp_number, display_name },
  });

  // El backend hoy no expone un GET /me, asi que guardamos localmente lo que
  // ya sabemos del usuario. rating/deal_count arrancan en 0 hasta que haya
  // deals completados de verdad.
  const user: User = {
    id: auth.user_id,
    whatsapp_number,
    wallet_address: "",
    display_name: display_name || whatsapp_number,
    profile_photo_url: "",
    rating: 0,
    deal_count: 0,
  };

  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token: auth.token, user };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
