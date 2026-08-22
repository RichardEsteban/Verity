import { getState } from "../state.js";
import { createDeal as backendCreateDeal, kapsoCreatePayment } from "../utils/backend_api.js";
import { messages } from "../utils/format_messages.js";

export function start(phone) {
  const state = getState(phone);
  state.step = "awaiting_service";
  state.draftDeal = {};
  return messages.askService();
}

export function setService(phone, text) {
  const state = getState(phone);
  state.draftDeal.service_description = text.trim();
  state.step = "awaiting_price";
  return messages.askPrice(state.draftDeal.service_description);
}

export async function setPrice(phone, text) {
  const state = getState(phone);
  const amount = Number(text.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) {
    return messages.invalidPrice();
  }

  const deal = await backendCreateDeal(state.token, state.draftDeal.service_description, amount);
  state.activeDealId = deal.deal_id;
  state.step = "idle";
  state.draftDeal = null;

  let paymentUrl = null;
  try {
    const payment = await kapsoCreatePayment(deal.deal_id, amount, phone);
    paymentUrl = payment.payment_url;
  } catch {
    // El link de pago es un plus; si Kapso no responde igual seguimos con /pagar.
  }

  return messages.dealCreated(deal, paymentUrl);
}
