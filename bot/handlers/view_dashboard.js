import { getState } from "../state.js";
import { myDeals } from "../utils/backend_api.js";
import { messages } from "../utils/format_messages.js";

export async function listDeals(phone) {
  const state = getState(phone);
  const deals = await myDeals(state.token);
  return messages.dealsList(deals);
}
