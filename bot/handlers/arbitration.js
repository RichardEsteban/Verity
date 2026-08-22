import { getState } from "../state.js";
import { startArbitration } from "../utils/backend_api.js";
import { messages } from "../utils/format_messages.js";

export async function run(phone) {
  const state = getState(phone);
  if (!state.activeDealId) return messages.noActiveDeal();

  const result = await startArbitration(state.activeDealId);
  return messages.arbitrationResult(result);
}
