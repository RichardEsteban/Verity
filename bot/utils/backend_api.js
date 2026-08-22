const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function request(path, { method = "GET", token, body, isMultipart = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !isMultipart) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, { method, headers, body: payload });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Backend ${method} ${path} -> ${response.status}: ${errorBody}`);
  }
  return response.json();
}

export function authWhatsapp(whatsappNumber, displayName) {
  return request("/api/auth/whatsapp", {
    method: "POST",
    body: { whatsapp_number: whatsappNumber, display_name: displayName },
  });
}

export function createDeal(token, serviceDescription, amountPen) {
  return request("/api/deals/create", {
    method: "POST",
    token,
    body: { service_description: serviceDescription, amount_pen: amountPen },
  });
}

export function myDeals(token) {
  return request("/api/deals/my-deals", { token });
}

export function getDeal(dealId) {
  return request(`/api/deals/${dealId}`);
}

export function kapsoCreatePayment(dealId, amount, userPhone) {
  return request("/api/kapso/create-payment", {
    method: "POST",
    body: { deal_id: dealId, amount, user_phone: userPhone },
  });
}

export function kapsoConfirmPayment(dealId, amount, paymentId) {
  return request("/api/kapso/webhook", {
    method: "POST",
    body: { deal_id: dealId, amount, status: "confirmed", payment_id: paymentId },
  });
}

export function uploadPhoto(token, dealId, buffer, filename, contentType) {
  const form = new FormData();
  form.append("photo", new Blob([buffer], { type: contentType }), filename);
  form.append("metadata", JSON.stringify({}));
  return request(`/api/deals/${dealId}/upload-photo`, { method: "POST", token, body: form, isMultipart: true });
}

export function startArbitration(dealId) {
  return request(`/api/arbitrage/${dealId}/start`, { method: "POST" });
}

export function earnings(token) {
  return request("/api/analytics/earnings", { token });
}
