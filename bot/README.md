# bot/

Bot de WhatsApp (Node.js + Express). Habla con el [backend](../backend) para
crear deals, confirmar pagos, subir evidencia y arbitrar.

Corre en **modo simulado** por default (sin `WHATSAPP_API_TOKEN` /
`WHATSAPP_PHONE_NUMBER_ID` en el `.env`): en vez de mandar mensajes reales por
la Graph API de WhatsApp, los loguea en la consola y — via
`/dev/simulate-message` — los devuelve directo en la respuesta HTTP, para
poder probar toda la conversacion con `curl` sin tener una cuenta de WhatsApp
Business todavia.

## Correr localmente

Con el [backend](../backend) corriendo en `http://localhost:8000`:

```bash
npm install
cp .env.example .env
npm start
```

Bot en `http://localhost:3001`.

## Probar la conversacion completa (sin WhatsApp real)

```bash
# 1. Empezar
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"/crear_deal"}'

# 2. Servicio
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"Reparar caneria"}'

# 3. Precio -> crea el deal en el backend
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"150"}'

# 4. Simular que el cliente ya pago
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"/pagar"}'

# 5. Enviar evidencia (mediaId simulado, no hace falta un archivo real)
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","mediaId":"foto_demo_1"}'

# 6. Arbitrar -> dispara GenLayer + PayBot simulados y libera el pago
curl -X POST http://localhost:3001/dev/simulate-message \
  -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"/arbitrar"}'
```

## Pasar a WhatsApp real

1. Crear una app en [Meta for Developers](https://developers.facebook.com) con el producto WhatsApp.
2. Llenar `WHATSAPP_API_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` en `.env`.
3. Exponer este servidor con una URL publica (ej. `ngrok http 3001`) y
   configurarla como webhook en Meta, usando el mismo valor de
   `WHATSAPP_WEBHOOK_VERIFY_TOKEN` del `.env` en la verificacion.
4. A partir de ahi, los mensajes reales entran por `POST /webhook` y las
   respuestas se mandan por la Graph API en vez de quedar en modo simulado.
