import "dotenv/config";
import express from "express";

import { getState } from "./state.js";
import { ensureAuth } from "./middleware/auth.js";
import { sendText } from "./utils/whatsapp_client.js";
import { messages } from "./utils/format_messages.js";
import * as createDealHandler from "./handlers/create_deal.js";
import * as kapsoPaymentHandler from "./handlers/kapso_payment.js";
import * as uploadPhotoHandler from "./handlers/upload_photo.js";
import * as viewDashboardHandler from "./handlers/view_dashboard.js";
import * as quickEarningsHandler from "./handlers/quick_earnings.js";
import * as arbitrationHandler from "./handlers/arbitration.js";

const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "dev-verify-token";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Meta llama a este GET una sola vez al configurar el webhook, para verificarlo.
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

async function handleIncomingMessage(phone, text, mediaId) {
  await ensureAuth(phone);
  const state = getState(phone);

  if (mediaId) {
    return uploadPhotoHandler.handle(phone, mediaId);
  }

  if (state.step === "awaiting_service") return createDealHandler.setService(phone, text);
  if (state.step === "awaiting_price") return createDealHandler.setPrice(phone, text);

  const command = (text || "").trim().toLowerCase();
  switch (command) {
    case "/start":
    case "/ayuda":
    case "/help":
      return messages.welcome();
    case "/crear_deal":
      return createDealHandler.start(phone);
    case "/pagar":
      return kapsoPaymentHandler.confirm(phone);
    case "/arbitrar":
      return arbitrationHandler.run(phone);
    case "/mis_deals":
      return viewDashboardHandler.listDeals(phone);
    case "/ganancias":
      return quickEarningsHandler.summary(phone);
    default:
      return messages.unknownCommand();
  }
}

// Webhook real de WhatsApp Cloud API.
app.post("/webhook", (req, res) => {
  res.sendStatus(200); // WhatsApp espera un 200 inmediato, no cuando termine el proceso.

  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const phone = message.from;
  const text = message.text?.body;
  const mediaId = message.image?.id;

  handleIncomingMessage(phone, text, mediaId)
    .then((reply) => sendText(phone, reply))
    .catch((error) => console.error("Error procesando mensaje de WhatsApp:", error));
});

// Solo para desarrollo: simula un mensaje entrante sin necesitar una cuenta
// de WhatsApp Business real, y devuelve la respuesta directo en la response
// (en vez de mandarla por la Graph API) para poder probar el bot con curl.
app.post("/dev/simulate-message", async (req, res) => {
  try {
    const { from, text, mediaId } = req.body;
    if (!from) return res.status(400).json({ error: "Falta 'from' (numero de telefono)" });
    const reply = await handleIncomingMessage(from, text, mediaId);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bot de WhatsApp escuchando en http://localhost:${PORT}`);
});

export default app;
