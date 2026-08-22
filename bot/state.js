/**
 * Estado de conversacion en memoria, igual de "solo para la demo" que
 * backend/app/db/store.py: nada persiste entre reinicios del bot.
 */

const conversations = new Map();

export function getState(phone) {
  if (!conversations.has(phone)) {
    conversations.set(phone, {
      step: "idle",
      draftDeal: null,
      activeDealId: null,
      token: null,
      userId: null,
    });
  }
  return conversations.get(phone);
}

export function resetConversations() {
  conversations.clear();
}
