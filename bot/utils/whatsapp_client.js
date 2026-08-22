const GRAPH_API_BASE = "https://graph.facebook.com/v20.0";

function isMockMode() {
  return !process.env.WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID;
}

/** Guarda lo que se "enviaria" en modo simulado, para poder inspeccionarlo en tests. */
export const sentMessages = [];

export async function sendText(to, body) {
  if (isMockMode()) {
    sentMessages.push({ to, body });
    console.log(`[whatsapp:mock] -> ${to}: ${body}`);
    return { mock: true };
  }

  const response = await fetch(`${GRAPH_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp send fallo: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

export async function downloadMedia(mediaId) {
  if (isMockMode()) {
    return {
      buffer: Buffer.from(`foto-simulada-${mediaId}`),
      contentType: "image/jpeg",
      filename: `${mediaId}.jpg`,
    };
  }

  const metaResponse = await fetch(`${GRAPH_API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` },
  });
  if (!metaResponse.ok) throw new Error(`No se pudo obtener metadata de media ${mediaId}`);
  const meta = await metaResponse.json();

  const fileResponse = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` },
  });
  if (!fileResponse.ok) throw new Error(`No se pudo descargar media ${mediaId}`);

  const arrayBuffer = await fileResponse.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: meta.mime_type || "image/jpeg", filename: `${mediaId}.jpg` };
}
