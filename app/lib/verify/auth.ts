"use client";

import type { User } from "./types";
import { CURRENT_USER } from "./mock-data";

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

export function login(whatsapp_number: string, display_name: string) {
  const user: User = {
    ...CURRENT_USER,
    whatsapp_number,
    display_name: display_name || CURRENT_USER.display_name,
  };
  localStorage.setItem(TOKEN_KEY, `mock.${btoa(whatsapp_number)}.jwt`);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token: getToken(), user };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
