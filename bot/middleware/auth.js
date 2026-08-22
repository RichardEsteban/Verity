import { getState } from "../state.js";
import { authWhatsapp } from "../utils/backend_api.js";

/** Registra/loguea al usuario en el backend la primera vez que escribe, y cachea el JWT. */
export async function ensureAuth(phone, displayName) {
  const state = getState(phone);
  if (state.token) return state;

  const auth = await authWhatsapp(phone, displayName);
  state.token = auth.token;
  state.userId = auth.user_id;
  return state;
}
