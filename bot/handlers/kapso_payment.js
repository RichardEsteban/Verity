import { getState } from "../state.js";
import { getDeal, kapsoConfirmPayment } from "../utils/backend_api.js";
import { messages } from "../utils/format_messages.js";

/** Simula la confirmacion de pago que en produccion manda Kapso via webhook. */
export async function confirm(phone) {
  const state = getState(phone);
  if (!state.activeDealId) return messages.noActiveDeal();

  const deal = await getDeal(state.activeDealId);
  await kapsoConfirmPayment(state.activeDealId, deal.amount_pen, `kapso_${Date.now()}`);
  return messages.paymentConfirmed();
}
