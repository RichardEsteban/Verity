import { getState } from "../state.js";
import { uploadPhoto } from "../utils/backend_api.js";
import { downloadMedia } from "../utils/whatsapp_client.js";
import { messages } from "../utils/format_messages.js";

export async function handle(phone, mediaId) {
  const state = getState(phone);
  if (!state.activeDealId) return messages.noActiveDeal();

  const { buffer, contentType, filename } = await downloadMedia(mediaId);
  await uploadPhoto(state.token, state.activeDealId, buffer, filename, contentType);
  return messages.photoReceived();
}
