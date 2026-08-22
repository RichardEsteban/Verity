import { getState } from "../state.js";
import { earnings } from "../utils/backend_api.js";
import { messages } from "../utils/format_messages.js";

export async function summary(phone) {
  const state = getState(phone);
  const data = await earnings(state.token);
  return messages.earnings(data);
}
