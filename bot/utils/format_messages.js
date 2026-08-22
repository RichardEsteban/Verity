export const messages = {
  welcome: () =>
    "Hola, soy el bot de Verify.\n\n" +
    "Comandos:\n" +
    "/crear_deal - crear un nuevo trato\n" +
    "/pagar - confirmar el pago del trato activo (simulado, lo haria Kapso)\n" +
    "/arbitrar - evaluar la evidencia y liberar el pago\n" +
    "/mis_deals - ver tus tratos\n" +
    "/ganancias - ver tus ganancias\n" +
    "/ayuda - ver esta ayuda",

  askService: () => "Que servicio vas a ofrecer?",

  askPrice: (service) => `"${service}" - Cuanto cuesta en soles?`,

  invalidPrice: () => "Ingresa un numero valido, ejemplo: 150",

  dealCreated: (deal, paymentUrl) =>
    `Trato creado (${deal.status})\n` +
    `ID: ${deal.deal_id}\n` +
    `Link: ${deal.share_link}\n\n` +
    "Cuando tu cliente pague, escribe /pagar para confirmarlo (en produccion esto lo dispara Kapso solo)." +
    (paymentUrl ? `\nLink de pago: ${paymentUrl}` : ""),

  noActiveDeal: () => "No tienes un trato activo. Escribe /crear_deal para empezar uno.",

  paymentConfirmed: () => "Pago confirmado y en garantia. Envia una foto del trabajo terminado como evidencia.",

  photoReceived: () => "Foto recibida. Escribe /arbitrar para evaluar la evidencia y liberar el pago.",

  arbitrationResult: (result) => {
    if (result.decision === "CUMPLIDO") {
      return (
        `Arbitraje: CUMPLIDO (${result.confidence}% de confianza)\n` +
        `Pago liberado: ${result.payout?.amount_usdt} USDT\n` +
        `TX: ${result.payout?.tx_hash}`
      );
    }
    return (
      `Arbitraje: ${result.decision} (${result.confidence}% de confianza)\n` +
      "El trato quedo en disputa, no se libero el pago."
    );
  },

  dealsList: (deals) => {
    if (!deals.length) return "No tienes tratos todavia.";
    return deals.map((d) => `- ${d.service_description}: S/${d.amount_pen} (${d.status})`).join("\n");
  },

  earnings: (data) => `Total ganado: S/${data.total}\nTratos completados: ${data.deals_count}`,

  unknownCommand: () => "No entendi ese mensaje. Escribe /ayuda para ver los comandos.",
};
