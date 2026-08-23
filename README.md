# 🚀 VERIFY 

**Documento de referencia para desarrollo **

---

## Demo en vivo

No requiere instalar nada. Tres servicios desplegados, todos hablando entre sí:

| Servicio | URL |
|---|---|
| Dashboard (frontend) | https://frontend-gilt-pi-76.vercel.app |
| API (backend, Swagger) | https://verity-production-866b.up.railway.app/docs |
| Bot de WhatsApp (modo simulado) | https://bot-production-f3de7.up.railway.app/health |

(La raíz `/` de backend y bot no sirve nada — son servicios sin interfaz
propia. `/docs` es la API interactiva completa; `/health` solo confirma que
el bot está arriba, la conversación se prueba con los `curl` de abajo.)

El bot corre en modo simulado (sin cuenta de WhatsApp Business): en vez de
mandar mensajes reales, expone `/dev/simulate-message` para probar la
conversación completa por HTTP. Cada paso responde igual que le respondería
al usuario por WhatsApp.

```bash
BOT=https://bot-production-f3de7.up.railway.app

curl -X POST $BOT/dev/simulate-message -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"/crear_deal"}'

curl -X POST $BOT/dev/simulate-message -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"Reparar caneria"}'

curl -X POST $BOT/dev/simulate-message -H "Content-Type: application/json" \
  -d '{"from":"+51999999999","text":"150"}'
```

La última respuesta incluye un `Link:` con el ID del deal. Abrirlo en el
dashboard público (sin login):

```
https://frontend-gilt-pi-76.vercel.app/deals/<deal_id>
```

Ahí se ve el deal recién creado por el bot, en tiempo real. Para completar
el flujo (pago, evidencia, arbitraje y el payout real vía WDK), seguir el
resto de la conversación simulada en [`bot/README.md`](bot/README.md) y
disparar `/dashboard/deals/<deal_id>/live` en el dashboard para ver la
animación de arbitraje conectada al WebSocket real del backend.

---

## Verificación para el jurado — pago real vía WDK

Este proyecto usa **`@tetherto/wdk-cli`** (el paquete requerido para Track 1)
para ejecutar pagos reales en Sepolia testnet. Los pasos a continuación
generan una transacción nueva, verificable de forma independiente en
[sepolia.etherscan.io](https://sepolia.etherscan.io).

Se utiliza una wallet de prueba dedicada, sin valor real, conforme a las
reglas del hackathon ("Use a dedicated test wallet with limited funds").
Cuenta con ~999,000 `musdt` (token propio, mismo estándar ERC-20 que USDT,
6 decimales — detalle en [`contracts/README.md`](contracts/README.md))
y Sepolia ETH para gas.

```bash
# 1. Instalar el CLI (Node >= 22.18.0)
npm install -g @tetherto/wdk-cli

# IMPORTANTE: abran una terminal NUEVA despues de este install (o reinicien
# VS Code si usan su terminal integrada) -- si no, el comando `wdk` de abajo
# no se va a encontrar aunque la instalacion haya funcionado.

# 2. Importar la wallet de prueba
export WDK_PASSPHRASE="verify-demo-2026"
echo "ketchup mistake verify observe face chunk lunar palace retire february begin lecture" | wdk wallet import --name verify --seed-stdin
wdk wallet unlock --name verify --ttl 0

# 3. Registrar el token de prueba (ya deployado, ver contracts/deployed.json)
wdk token add '{"network":"sepolia","token":"musdt","symbol":"USDT","decimals":6,"isNative":false,"address":"0x859e861cfA14f8e5aA5765Fe3941670FB41E5A8A"}'

# 4. Mandar una transferencia real
wdk send --network sepolia --to 0x000000000000000000000000000000000000dEaD --amount 1 --token musdt --wallet verify --json
```

El comando retorna un `txHash` real, verificable en
`https://sepolia.etherscan.io/tx/<hash>`.

Para probar el flujo completo del producto (bot → backend → arbitraje IA →
payout real), completar `backend/.env` con las mismas credenciales
(`WDK_WALLET_NAME=verify`, `WDK_PASSPHRASE=verify-demo-2026`,
`WDK_NETWORK=sepolia`, `WDK_TOKEN=musdt`) y seguir
[`backend/README.md`](backend/README.md). Kapso, el arbitraje por IA
(Gemini/Claude) y el almacenamiento de fotos están simulados de forma
intencional — la única integración real es el pago vía WDK, que es lo que
este track evalúa.

Transacciones ya minadas durante el desarrollo (referencia adicional en
caso de que la red esté lenta el día de la revisión):
[`0x65cb292a...988613`](https://sepolia.etherscan.io/tx/0x65cb292a20b26e2df039a749b8b16ee4d79cde37b526a7fe84e63932c9988613) ·
[`0xb3b540a6...1ac160`](https://sepolia.etherscan.io/tx/0xb3b540a6913d1fe909527b9a46ffb37ffe3ee23cb3739ea458b15da1da1ac160)

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [El Problema](#el-problema)
3. [La Solución](#la-solución)
4. [Arquitectura General](#arquitectura-general)
5. [Flujo Completo de Transacción](#flujo-completo-de-transacción)
6. [Estructura del Repositorio](#estructura-del-repositorio)
7. [Plan de 26 Horas](#plan-de-26-horas)
8. [Especificaciones Técnicas](#especificaciones-técnicas)
9. [API Endpoints](#api-endpoints)
10. [Componentes Principales](#componentes-principales)
11. [Setup Inicial](#setup-inicial)
12. [Testing & Deployment](#testing--deployment)

---

## RESUMEN EJECUTIVO

**Proyecto:** Verify - Plataforma de garantía universal P2P con arbitraje por IA

**Público Objetivo:** Mercado informal (taxistas, plomeros, electricistas, vendedores)

**Diferencial:**
- ✅ **Kapso**: Pagos locales sin wallet (QR, transferencia bancaria)
- ✅ **WhatsApp Bot**: Interfaz conversacional natural
- ✅ **Web Dashboard**: Transparencia en tiempo real
- ✅ **GenLayer**: Arbitraje por IA (Gemini + Claude)
- ✅ **PayBot + WDK**: Pagos automáticos en USDT
- ✅ **Animación Live**: Ver agents trabajando en la web

**Stack:**
- Frontend: Next.js 14 (dashboard) + WhatsApp Bot (Node.js)
- Backend: FastAPI (Python)
- Blockchain: Solidity (Avalanche Sepolia)
- Pagos: Kapso + WDK CLI
- Data: Supabase + Pinata (IPFS)
- AI: Gemini + Claude API

**Timeline:** 26 horas (Aleph Hackathon)

**Track:** WDK Track 1A ($1,000 USDT)

---

## EL PROBLEMA

### Barrera #1: Adopción en Mercado Informal

```
ANTES (Dashboard web tradicional):
Usuario no-tech = "¿Wallet? ¿Blockchain? ¿Seed phrase?"
                  ❌ 95% abandona aquí
                  ❌ Requiere Metamask
                  ❌ Requiere entender gas fees

AHORA (Kapso + WhatsApp):
Usuario = Abre WhatsApp (ya está ahí)
        = Escanea QR Kapso (paga con su banco)
        = ✅ 30 segundos, dinero real local
        = ✅ No ve blockchain nunca
```

### Barrera #2: Visibilidad del Arbitraje

```
BOT (solo):
Bot: "GenLayer analizando..."
     [espera 30 seg]
Bot: "✅ Pagado"
User: "¿Qué pasó en esos 30 seg?" ❌

BOT + WEB + ANIMACIÓN:
Bot: "GenLayer analizando... [Ver en vivo](verify.app/deals/123)"
Web: Animación en vivo mostrando:
     ├─ Gemini analizando: [||||    ]
     ├─ Claude analizando: [  ||||  ]
     ├─ Consensus: "CUMPLIDO"
     └─ PayBot enviando: "Transferencia a Juan..."
User: Entiende EXACTAMENTE qué pasó ✅
```

### Barrera #3: Confianza en Fondos

```
Usuario piensa: "¿Dónde está mi dinero?"

Solución:
├─ Supabase: Registro auditable
├─ Blockchain: Smart contract con escrow
├─ Kapso: Transacción confirmada
├─ Web: Ver estado en tiempo real
└─ Notificaciones: Bot confirma cada paso
```

---

## LA SOLUCIÓN

### Visión General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USUARIO (Mercado Informal)                            │
│                                                                           │
│  Plomero, Taxista, Electricista = SIN WALLET, SIN CRYPTO               │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
        ┌───────▼────────┐         ┌────────▼─────────┐
        │ WHATSAPP BOT   │         │ WEB DASHBOARD    │
        │ (Node.js)      │         │ (Next.js)        │
        │                │         │                  │
        │ ✅ Crear deal  │         │ ✅ Analytics    │
        │ ✅ Kapso QR    │         │ ✅ Agents vivo  │
        │ ✅ Enviar foto │         │ ✅ Retirar $    │
        │ ✅ Notifs      │         │ ✅ Timeline     │
        └───────┬────────┘         └────────┬─────────┘
                │                           │
                └───────────┬───────────────┘
                            │
                    ┌───────▼─────────┐
                    │ BACKEND         │
                    │ (FastAPI)       │
                    │                 │
                    │ ✅ Routers      │
                    │ ✅ Services     │
                    │ ✅ Agents       │
                    │ ✅ WebSocket    │
                    └───────┬─────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
        ┌───▼──┐        ┌──▼───┐      ┌───▼──┐
        │Kapso │        │Supa  │      │WDK   │
        │Pagos │        │base  │      │Payout│
        └──────┘        └──────┘      └──────┘
```

---

## ARQUITECTURA GENERAL

### Capa 1: Interfaz de Usuario (Entrada)

**WHATSAPP BOT (Node.js)**
- Conversación natural
- Kapso QR para pagos
- Recibir fotos con metadata
- Notificaciones en tiempo real
- Botones interactivos (WhatsApp Interactive Messages) para acciones

**WEB DASHBOARD (Next.js)**
- Authentication JWT
- Ver deals en tabla
- Gráficos de ingresos
- Arbitration timeline con animación
- Retirar dinero (Kapso)
- Editar perfil

### Capa 2: Lógica de Negocio (Backend)

**FASTAPI (Python)**

Routers:
- `/api/auth/whatsapp` - Autenticación WhatsApp
- `/api/deals/*` - CRUD deals
- `/api/arbitrage/*` - GenLayer
- `/api/kapso/*` - Integración Kapso
- `/api/withdraw/*` - Retiros
- `/api/analytics/*` - Stats

Services:
- `deal_service.py` - Lógica de deals
- `kapso_service.py` - Cliente Kapso
- `analytics_service.py` - Cálculos
- `websocket_service.py` - Eventos en vivo

Agents:
- `genlayer_agent.py` - Gemini + Claude voting
- `paybot_agent.py` - Pagos automáticos
- `wdk_cli_wrapper.py` - Subprocess a WDK CLI

### Capa 3: Data Layer

**SUPABASE (PostgreSQL)**
- users (id, whatsapp_number, wallet_address, rating)
- deals (id, seller_id, buyer_id, amount, status, created_at)
- photos (id, deal_id, ipfs_hash, metadata)
- payments (id, deal_id, kapso_payment_id, amount, status)
- arbitration_logs (id, deal_id, agent, decision, confidence)
- payout_logs (id, deal_id, tx_hash, status)
- ratings (id, from_user, to_user, score, comment)

**PINATA (IPFS)**
- Almacenar fotos de deals
- Metadata: timestamp, GPS, EXIF

**AVALANCHE SEPOLIA (Blockchain)**
- Deal.sol: Escrow smart contract
- USDT token address

### Capa 4: Sistemas Externos

**KAPSO**
- Crear QR de pago
- Webhook de confirmación
- Converter PEN → USDT

**WDK CLI**
- Crear wallets custodiales
- Enviar USDT a plazos
- JSON audit trail

**GEMINI & CLAUDE APIs**
- Analizar fotos + acuerdo
- Votación mayoritaria
- Confidencia del veredicto

---

## FLUJO COMPLETO DE TRANSACCIÓN

### Caso de Uso B: Proyecto Grande con Pagos por Hitos (S/12,000 — remodelación completa)

Una empresa constructora remodela una cocina completa para un cliente. El monto ya no cabe en
un pago único ni en un veredicto binario: se libera en **3 hitos**, cada uno con su propio
escrow, evidencia y arbitraje, y el payout dispara guardrails adicionales por tratarse de un
monto alto.

```
DEAL: "Remodelación cocina completa"
MONTO TOTAL: S/12,000 (~3,250 USDT)
ESTRUCTURA: 3 hitos (Demolición 20% | Instalación 50% | Acabados 30%)
```

#### PASO 1: Crear Deal con Hitos (WhatsApp + Backend)

```
USUARIO (WhatsApp):
Constructora: "/crear_deal"
Bot: "¿Qué servicio?"
Constructora: "Remodelación cocina completa"
Bot: "¿Precio total?"
Constructora: "12000"
Bot: "Monto > S/1,000. ¿Dividir en hitos? [Sí] [No]"
Constructora: "Sí" → "3 hitos: Demolición 20%, Instalación 50%, Acabados 30%"

↓ POST /api/deals/create { milestones: true }

BACKEND:
├─ Crear deal padre: "deal_xyz789" (status: pending_buyer)
├─ Crear 3 sub-deals (milestones):
│  ├─ milestone_1: "Demolición" — S/2,400 — status: pending
│  ├─ milestone_2: "Instalación" — S/6,000 — status: locked
│  └─ milestone_3: "Acabados" — S/3,600 — status: locked
├─ Flag: high_value = true (monto > $1,000 → guardrails extra)
└─ Emitir WebSocket: "deal_created" (con milestones)

WEB (dashboard):
└─ Deal card muestra barra de progreso: [Hito 1/3] ░░░░░░░░░░ 0%
```

#### PASO 2-4: Ciclo por Hito (se repite 3 veces)

```
Por cada hito activo:

1. PAGO (Kapso)
   Cliente paga SOLO el monto del hito actual (ej: S/2,400 del Hito 1)
   → Escrow parcial, no el total del proyecto

2. EVIDENCIA
   Constructora sube fotos específicas del hito ("Demolición completa")
   → IPFS + metadata, asociadas a milestone_1, no al deal completo

3. ARBITRAJE (GenLayer)
   Gemini + Claude evalúan SOLO el alcance de ese hito
   → Consensus: "CUMPLIDO" (2/2) desbloquea milestone_1

4. PAYOUT PARCIAL (PayBot)
   Se libera solo S/2,400 → ~650 USDT a la constructora
   El resto (S/9,600) sigue en escrow, milestone_2 se activa

WEB (en vivo):
[Hito 1/3] ██████████ 100% ✅  →  [Hito 2/3] ░░░░░░░░░░ 0% (activo)
```

#### PASO 5: Payout de Hito Alto Valor — Guardrails Extra (PayBot + WDK)

```
BACKEND (PayBot Agent) — flujo normal + capas extra por high_value=true:

├─ Verificar arbitration: CUMPLIDO ✓ (2/2 consensus, sin margen de duda)
├─ Verificar guardrails ESTÁNDAR:
│  ├─ Constructora en whitelist? ✓
│  └─ Daily limit OK? ✓ (acumulado del día, no solo este payout)
│
├─ Verificar guardrails de MONTO ALTO (> $1,000):
│  ├─ Requiere confidence ≥ 95% en AMBOS agentes (no solo mayoría) ✓
│  ├─ Revisión manual opcional si confidence < 95% → pausa + notif admin
│  ├─ Payout se ejecuta en tramos, nunca el total de una vez
│  └─ Segundo log de auditoría (payout_logs + high_value_audit_logs)
│
├─ Convertir: S/2,400 → ~650 USDT (solo el hito, no el proyecto completo)
├─ Ejecutar: wdk send --to constructora --amount 650 --token USDT
├─ Recibir: tx_hash = "0x9f8e7d..."
├─ Guardar en Supabase (vinculado a milestone_1, no al deal padre)
└─ Emitir WebSocket: "milestone_payout_complete"

WEB (ANIMACIÓN PAYBOT — vista de hitos):
┌─────────────────────────────────────┐
│ PAYOUT — Hito 1/3: Demolición        │
│ [████████████████████████] Complete │
│ TX: 0x9f8e7d...                      │
│ Amount: 650 USDT (de 3,250 totales)  │
│ Escrow restante: 2,600 USDT          │
│ Status: ✅ CONFIRMED                 │
└─────────────────────────────────────┘

BOT (notifica):
"✅ Hito 1/3 completado: Demolición
✅ 650 USDT liberados a Constructora

Progreso del proyecto: S/2,400 / S/12,000 (20%)
Escrow restante: S/9,600
Siguiente hito: Instalación (S/6,000)
[Ver dashboard completo]"

WEB (final, tras los 3 hitos):
Deal status: "COMPLETED"
Timeline:
├─ Hito 1 (Demolición):   S/2,400 ✓  pagado 2024-08-23 15:27
├─ Hito 2 (Instalación):  S/6,000 ✓  pagado 2024-08-24 11:10
├─ Hito 3 (Acabados):     S/3,600 ✓  pagado 2024-08-25 09:45
└─ Total liberado: S/12,000 (~3,250 USDT) en 3 payouts

[Rating Section]:
Cliente: ⭐⭐⭐⭐⭐ "Proyecto grande, cero fricción en pagos por etapa"
Constructora: ⭐⭐⭐⭐⭐ "Cobré cada avance sin perseguir al cliente"
```

### Caso de Uso C: Depósito de Garantía Airbnb-style (S/800 — flujo completo desde el contrato)

A diferencia de A y B, aquí el dinero **no fluye en una sola dirección**. El huésped deposita
una garantía completa ANTES de la estadía, y el contrato debe resolver DESPUÉS si ese dinero
vuelve 100% al huésped, se queda 100% con el anfitrión, o se **divide** entre reparación y
devolución. El flujo completo pasa por el smart contract desde la creación del depósito, no
solo por el cálculo final del excedente.

```
DEAL: "Depósito de garantía — Departamento Miraflores"
TIPO: deposit (no service)
MONTO DEPÓSITO: S/800 (~216 USDT), bloqueado ANTES del check-in
POSIBLES DESENLACES: reembolso total | reembolso parcial + reparación | sin reembolso
```

#### PASO 0: Reserva y Creación del Contrato de Depósito (WhatsApp + Backend + Deal.sol)

```
USUARIO (WhatsApp):
Huésped: "/reservar Depto Miraflores"
Bot: "Fechas de estadía?"
Huésped: "28 ago - 31 ago"
Bot: "Depósito de garantía requerido: S/800 (reembolsable)"

↓ POST /api/deals/create { type: "deposit", checkin, checkout }

BACKEND:
├─ Crear deal: "deal_deposit_456" (deal_type: "deposit")
├─ Estado: "awaiting_deposit"
└─ Llamar smart contract:
   Deal.sol.createDeposit(host, guest, amount=800, checkin, checkout)
   ├─ Deploya instancia de escrow para este deal (aún sin fondos)
   └─ Retorna: contract_address = "0xAb12..."

BOT (respuesta):
"✅ Reserva creada. Paga el depósito de garantía para confirmar:
[Botón: Pagar S/800 con Kapso]
El depósito se libera automáticamente al checkout si no hay daños."
```

#### PASO 1: Huésped Paga el Depósito → Escrow On-Chain (Kapso → KapsoGateway.sol → Deal.sol)

```
Huésped paga S/800 vía Kapso QR (igual que Caso A/B)

↓ KAPSO WEBHOOK → BACKEND
POST /api/kapso/webhook { deal_id: "deal_deposit_456", amount: 800, status: "confirmed" }

BACKEND:
├─ Verificar firma Kapso
├─ Llamar KapsoGateway.sol.convertAndForward(800, "PEN")
│  └─ Convierte S/800 → 216 USDT
├─ Llamar Deal.sol.lockDeposit(deal_deposit_456, 216 USDT)
│  └─ Fondos AHORA en escrow on-chain (no en Kapso, no en Supabase — en el contrato)
├─ Actualizar deal: status="deposit_locked"
└─ Emitir WebSocket: "deposit_locked"

BOT (notifica a ambos):
Huésped: "✅ Depósito de S/800 congelado en garantía. Disfruta tu estadía."
Anfitrión: "✅ Huésped confirmado. Depósito de garantía asegurado on-chain."

WEB (deal detail):
Estado: "🔒 Depósito bloqueado — 216 USDT en contrato 0xAb12..."
```

#### PASO 2: Estadía (Check-in → Check-out)

```
Día de check-in:
Bot: "Bienvenido. Anfitrión puede subir fotos del estado inicial (opcional)."
Deal status: "in_stay"

Día de check-out:
Bot (a ambos): "Estadía finalizada. Ventana de reporte de daños: 24h."
Deal status: "review_window"
```

#### PASO 3: Ventana de Reporte — Dos Ramas

```
RAMA A — Sin daños reportados en 24h:
├─ Anfitrión no reporta nada, o confirma "Todo OK"
├─ Trigger automático (cron backend): Deal.sol.refundFull(guest)
├─ Los 216 USDT completos vuelven al huésped
├─ Deal status: "completed_no_damage"
└─ Bot: "✅ Sin incidencias. Tus S/800 fueron devueltos íntegros."

RAMA B — Anfitrión reporta daños dentro de la ventana:
├─ Anfitrión: [Envía fotos antes/después] + "Costo estimado: S/300"
├─ Backend sube fotos a Pinata, guarda claim
├─ Deal status: "disputed"
└─ Trigger: genlayer_agent.start_arbitration() (con foco en daños, no en "cumplido/no cumplido")
```

#### PASO 4: Arbitraje de Daños (GenLayer) — a diferencia de A/B, no es binario

```
BACKEND (GenLayer Agent) — Rama B:

AGENT 1: Gemini
├─ Compara fotos "antes" vs "después"
├─ Evalúa el claim de S/300 contra el daño visible
└─ Veredicto: "Daño real ≈ S/220 (73% del reclamo)" (92% confianza)

AGENT 2: Claude
├─ Mismo análisis, independiente
└─ Veredicto: "Daño real ≈ S/220" (90% confianza)

CONSENSUS: 2/2 coinciden en monto → S/220 justificado (no los S/300 reclamados)
├─ repair_amount = S/220 (para el anfitrión)
├─ refund_amount = S/580 (excedente, de vuelta al huésped)
└─ Emitir WebSocket: "arbitration_complete" (con split)

WEB (ANIMACIÓN EN VIVO):
┌─────────────────────────────────────┐
│ CONSENSUS — Evaluación de daño       │
│ [████████████████████████] Complete │
│ Reclamado: S/300 | Aprobado: S/220   │
│ Split: Anfitrión S/220 / Huésped S/580│
└─────────────────────────────────────┘
```

#### PASO 5: Payout Dividido — Reparación + Excedente en un Solo Contrato (PayBot + WDK)

```
BACKEND (PayBot Agent):

├─ Verificar arbitration: split aprobado ✓
├─ Verificar guardrails estándar (whitelist, daily limit) ✓
├─ Llamar Deal.sol.splitRelease(repairAmount=220, refundAmount=580)
│  └─ El propio contrato divide el escrow, no dos llamadas manuales sueltas
├─ Ejecutar 2 transferencias WDK en el mismo batch:
│  ├─ wdk send --to anfitrion --amount 59 --token USDT   (S/220 → 59 USDT, reparación)
│  └─ wdk send --to huesped --amount 156 --token USDT    (S/580 → 156 USDT, excedente)
├─ Guardar ambos tx_hash en payout_logs con role: "host_repair" / "guest_refund"
└─ Emitir WebSocket: "split_payout_complete"

BOT (notifica por separado):
Anfitrión: "✅ Daño verificado y aprobado
Recibiste: 59 USDT (S/220) por reparación"

Huésped: "✅ Daño evaluado: S/220 de S/300 reclamados
Recibiste de vuelta: 156 USDT (S/580, tu excedente)"

WEB (final):
Deal status: "COMPLETED"
Timeline:
├─ Depósito creado (contrato):   2024-08-28 09:00 ✓
├─ Depósito bloqueado on-chain:  2024-08-28 09:05 ✓
├─ Check-in:                     2024-08-28 15:00 ✓
├─ Check-out:                    2024-08-31 11:00 ✓
├─ Daño reportado:                2024-08-31 14:20 ✓
├─ Arbitraje (split S/220/S/580): 2024-08-31 15:00 ✓
└─ Payout dividido:               2024-08-31 15:03 ✓
   ├─ Anfitrión: 59 USDT (reparación)
   └─ Huésped:  156 USDT (excedente)

[Rating Section]:
Huésped: ⭐⭐⭐⭐ "Justo, me devolvieron lo que no era daño real"
Anfitrión: ⭐⭐⭐⭐⭐ "Cobré la reparación sin discutir con el huésped"
```

#### Diferencias clave entre los dos casos (tabla)

```
                        CASO B (S/12,000)          CASO C (S/800 depósito)
Dirección del dinero    Comprador→Vendedor         Huésped↔Anfitrión (bidireccional)
Cuándo se bloquea       Al pagar cada hito         ANTES de la estadía (contrato)
Pagos                   3 pagos por hito           1 depósito, resuelto después
Escrow                  Parcial, por hito          Completo, con posible split
Evidencia               1 set por hito             Antes/después, solo si hay disputa
Arbitraje               Binario por hito           Estima MONTO de daño, no solo veredicto
Resultado posible       Pagado o disputado         100% host | 100% guest | split entre ambos
Payout                  3 transacciones WDK        2 transacciones WDK simultáneas (split)
Contrato on-chain       Escrow con hitos           Deal.sol.splitRelease() nativo
Auditoría               payout_logs + high_value_audit_logs   payout_logs con role (host_repair/guest_refund)
```

---

## ESTRUCTURA DEL REPOSITORIO

```
verify-app/
│
├── 📄 README.md
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 docker-compose.yml
├── 📄 LICENSE
│
├── 🤖 bot/                           ← WHATSAPP BOT (Node.js)
│   ├── package.json
│   ├── .env.example
│   ├── index.js                      ← Entry point
│   ├── handlers/
│   │   ├── create_deal.js
│   │   ├── kapso_payment.js
│   │   ├─ upload_photo.js
│   │   ├─ view_dashboard.js
│   │   └── quick_earnings.js
│   ├── utils/
│   │   ├── backend_api.js
│   │   ├── kapso_integration.js
│   │   └── format_messages.js
│   └── middleware/
│       └── auth.js
│
├── 🚀 frontend/                      ← WEB DASHBOARD (Next.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── .env.example
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← Landing
│   │   ├── api/                      ← Server-side routes
│   │   │   ├── auth/
│   │   │   ├── deals/
│   │   │   └── withdraw/
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx              ← Overview
│   │       ├── deals/
│   │       │   ├── page.tsx          ← Tabla de deals
│   │       │   └── [id]/
│   │       │       ├── page.tsx      ← Deal detail
│   │       │       └── live.tsx      ← Arbitration animation
│   │       ├── analytics/
│   │       │   ├── page.tsx          ← Gráficos
│   │       │   └── charts.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       └── withdraw/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── agents/
│   │   │   ├── AgentAnimation.tsx    ← ⭐ NUEVA
│   │   │   ├── GeminiAgent.tsx
│   │   │   ├── ClaudeAgent.tsx
│   │   │   ├── PayBotAgent.tsx
│   │   │   └── ArbitrationTimeline.tsx
│   │   ├── deals/
│   │   │   ├── DealTable.tsx
│   │   │   ├── DealCard.tsx
│   │   │   └── DealDetail.tsx
│   │   ├── charts/
│   │   │   ├── IncomeChart.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── layout/
│   │       └── DashboardLayout.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── websocket.ts             ← WebSocket client
│   │   └── utils.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   └── public/
│       └── (logos, icons)
│
├── 🔧 backend/                       ← FASTAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models.py
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── deals.py
│   │   │   ├── arbitrage.py
│   │   │   ├── kapso.py
│   │   │   ├── withdraw.py
│   │   │   ├── analytics.py
│   │   │   └── websocket.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── deal_service.py
│   │   │   ├── kapso_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── websocket_service.py
│   │   │   └── image_service.py
│   │   │
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── genlayer_agent.py
│   │   │   ├── paybot_agent.py
│   │   │   └── wdk_cli_wrapper.py
│   │   │
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── supabase_client.py
│   │   │   └── models.py
│   │   │
│   │   └── utils/
│   │       ├── decorators.py
│   │       └── logger.py
│   │
│   └── tests/
│       ├── test_deals.py
│       ├── test_arbitrage.py
│       └── test_paybot.py
│
├── ⛓️  contracts/                     ← SOLIDITY
│   ├── package.json
│   ├── hardhat.config.js
│   │
│   ├── contracts/
│   │   ├── Deal.sol
│   │   ├── KapsoGateway.sol
│   │   └── interfaces/
│   │       ├── IKapso.sol
│   │       └── IERC20.sol
│   │
│   ├── scripts/
│   │   └── deploy.js
│   │
│   └── test/
│       └── Deal.test.js
│
├── 📚 docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── BOT_SETUP.md
│   ├── WDK_INTEGRATION.md
│   ├── KAPSO_INTEGRATION.md
│   ├── API.md
│   ├── DEMO_SCRIPT.md
│   └── SETUP.md
│
└── .github/
    └── workflows/
        └── ci.yml
```

---

## PLAN DE 26 HORAS

### HORA 0-3: Setup Inicial (3h)

```
TASKS:
├─ Crear repositorio + estructura carpetas
├─ Setup Node.js + Python envs
├─ Crear .env files (plantilla)
├─ Setup WhatsApp Business API (Meta for Developers) → obtener token + phone_number_id
├─ Setup Kapso account → obtener API key
├─ Setup Supabase project → database + auth
├─ Setup Pinata account → IPFS
├─ Install dependencies:
│  ├─ bot: npm install express axios dotenv
│  ├─ frontend: npm install next react axios ws
│  └─ backend: pip install fastapi uvicorn supabase dotenv
└─ Test: WhatsApp bot responde a mensaje de prueba

DELIVERABLE: Proyecto listo, dependencias instaladas
```

### HORA 3-7: WhatsApp Bot Base (4h)

```
TASKS:
├─ Bot entry point (index.js)
├─ Handler: /start
├─ Handler: /crear_deal (conversación multi-step)
├─ Handler: /mis_deals (list active)
├─ Handler: /help
├─ Integración backend_api.js (llamar FastAPI)
├─ Formateo de mensajes (bonitos, con markdown)
├─ Botones interactivos (WhatsApp Interactive Messages) para acciones
└─ Deploy a Heroku/Railway

TESTS:
├─ Bot responde a /start
├─ Conversación /crear_deal funciona
├─ Bot llama POST /api/deals/create
└─ Bot recibe respuesta OK

DELIVERABLE: Bot conversacional básico funciona
```

### HORA 7-13: Backend Core (6h)

```
TASKS:
├─ FastAPI app structure
├─ Supabase client setup
├─ Auth router:
│  └─ POST /api/auth/whatsapp (crear usuario)
│
├─ Deals router:
│  ├─ POST /api/deals/create
│  ├─ GET /api/deals/my-deals
│  ├─ GET /api/deals/{id}
│  └─ POST /api/deals/{id}/upload-photo
│
├─ Kapso service + router:
│  ├─ POST /api/kapso/create-payment
│  └─ POST /api/kapso/webhook (recibir confirmación)
│
├─ Database models (Supabase tables)
├─ CORS + JWT validation
└─ Error handling

TESTS:
├─ POST /api/deals/create retorna deal_id
├─ GET /api/deals/my-deals retorna lista
├─ POST /api/kapso/webhook procesa pago
└─ Endpoints tienen autenticación

DELIVERABLE: Backend CRUD funciona, Kapso integrado
```

### HORA 13-19: Frontend Dashboard (6h)

```
TASKS:
├─ Layout base (header, sidebar, footer)
├─ Auth page (login con WhatsApp JWT)
├─ Dashboard overview:
│  ├─ Cards: total ganado, deals, rating
│  └─ Tabla: deals recientes
│
├─ /dashboard/deals:
│  ├─ Tabla completa con filtros
│  ├─ Búsqueda
│  └─ Paginación
│
├─ /dashboard/deals/[id]:
│  ├─ Deal detail
│  ├─ Foto gallery
│  └─ WebSocket connection (animación)
│
├─ /dashboard/analytics:
│  ├─ Gráfico línea: ingresos/mes
│  └─ Gráfico pie: ingresos/categoría
│
├─ /profile
├─ /withdraw (form + confirmación)
└─ API routes (server-side)

TESTS:
├─ Dashboard carga datos
├─ Deal detail muestra fotos
├─ Gráficos calculan correctamente
└─ WebSocket conect OK

DELIVERABLE: Dashboard visualiza deals
```

### HORA 19-22: GenLayer + Animación (3h)

```
TASKS:
├─ GenLayer agent (Gemini + Claude)
├─ Arbitrage router:
│  └─ POST /api/arbitrage/{id}/start
│
├─ WebSocket service:
│  ├─ Emitir eventos de arbitración
│  └─ Actualizar clients en tiempo real
│
├─ AgentAnimation.tsx:
│  ├─ Componente Gemini + barra de progreso
│  ├─ Componente Claude + barra de progreso
│  ├─ Componente Consensus
│  ├─ Componente PayBot
│  └─ Timeline visual
│
└─ WebSocket client (lib/websocket.ts)

TESTS:
├─ GenLayer arbitra correctamente
├─ WebSocket emite eventos
├─ Animación actualiza en vivo
└─ Deal /live muestra agents

DELIVERABLE: Arbitración funciona + animación en web
```

### HORA 22-24: PayBot + Integración (2h)

```
TASKS:
├─ PayBot agent
├─ WDK CLI wrapper
├─ Guardrails (whitelist, caps, daily limit)
├─ Audit logging
├─ Integration: GenLayer → PayBot
├─ Payout router:
│  ├─ POST /withdraw/prepare
│  └─ POST /withdraw/confirm
│
└─ Test end-to-end:
   ├─ Deal creado
   ├─ Pagado (Kapso)
   ├─ Foto enviada
   ├─ GenLayer arbitra
   └─ PayBot paga

DELIVERABLE: Transacción completa de principio a fin
```

### HORA 24-26: Documentación + Demo (2h)

```
TASKS:
├─ README.md (completo)
├─ docs/ARCHITECTURE.md
├─ docs/BOT_SETUP.md
├─ docs/KAPSO_INTEGRATION.md
├─ docs/WDK_INTEGRATION.md
├─ docs/SETUP.md (cómo correr localmente)
│
├─ Video demo (2 minutos):
│  ├─ Parte 1 (60 seg): WhatsApp bot
│  │  ├─ Crear deal
│  │  ├─ Kapso QR
│  │  ├─ Enviar foto
│  │  └─ Pago recibido
│  │
│  └─ Parte 2 (60 seg): Web dashboard
│     ├─ Deal aparece en tabla
│     ├─ Animación agents
│     ├─ Payout confirmado
│     └─ Rating

└─ Checklist submission WDK Track 1A

DELIVERABLE: Proyecto completo + documentación + video
```

### BUFFER (0-2 horas)

```
├─ Bugs last-minute
├─ Pulido UI/UX
├─ Testing edge cases
└─ Checklist de submission
```

---

## ESPECIFICACIONES TÉCNICAS

### Variables de Ambiente

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_KAPSO_MERCHANT_ID=your_merchant_id
```

**Backend (.env)**
```
FASTAPI_ENV=development
DATABASE_URL=postgresql://user:pass@localhost/verify
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxxxxx

KAPSO_API_KEY=your_kapso_key
KAPSO_MERCHANT_ID=your_merchant_id

GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key

WDK_CLI_PATH=/usr/local/bin/wdk
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=your_key

PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_secret

JWT_SECRET=your_jwt_secret
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

**Bot (.env)**
```
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
BACKEND_URL=http://localhost:8000
KAPSO_MERCHANT_ID=your_merchant_id
NODE_ENV=development
```

### Modelo de Datos (Supabase)

**users**
```sql
id UUID PRIMARY KEY
whatsapp_number VARCHAR UNIQUE (identificador WhatsApp + destino Kapso)
wallet_address VARCHAR
display_name VARCHAR
profile_photo_url VARCHAR
rating FLOAT (0-5)
deal_count INT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**deals**
```sql
id UUID PRIMARY KEY
seller_id UUID (FK users)
buyer_id UUID (FK users)
service_description TEXT
amount_pen FLOAT (monto en soles)
amount_usdt FLOAT (convertido)
status VARCHAR (pending_buyer, escrowed, arbitrating, completed, disputed)
created_at TIMESTAMP
updated_at TIMESTAMP
completed_at TIMESTAMP
smart_contract_address VARCHAR
deal_type VARCHAR (service, deposit — "deposit" = depósito reembolsable estilo Airbnb)
is_milestone_based BOOLEAN (default false)
high_value BOOLEAN (true si amount_usdt > 1000, activa guardrails extra)
checkin_at TIMESTAMP (solo deal_type=deposit)
checkout_at TIMESTAMP (solo deal_type=deposit)
repair_amount_usdt FLOAT (solo deal_type=deposit, monto aprobado para el host)
refund_amount_usdt FLOAT (solo deal_type=deposit, excedente devuelto al guest)
```

**milestones** (solo si `deals.is_milestone_based = true`)
```sql
id UUID PRIMARY KEY
deal_id UUID (FK deals, deal padre)
order_index INT (1, 2, 3...)
description TEXT
amount_pen FLOAT
amount_usdt FLOAT
status VARCHAR (locked, pending, escrowed, arbitrating, completed)
unlocked_at TIMESTAMP (cuándo se activó tras completar el hito anterior)
completed_at TIMESTAMP
```

**photos**
```sql
id UUID PRIMARY KEY
deal_id UUID (FK deals)
uploaded_by UUID (FK users)
ipfs_hash VARCHAR
metadata JSON (timestamp, gps, exif)
uploaded_at TIMESTAMP
```

**payments**
```sql
id UUID PRIMARY KEY
deal_id UUID (FK deals)
kapso_payment_id VARCHAR
amount_pen FLOAT
currency VARCHAR (PEN)
status VARCHAR (pending, confirmed, failed)
webhook_received_at TIMESTAMP
confirmed_at TIMESTAMP
created_at TIMESTAMP
```

**arbitration_logs**
```sql
id UUID PRIMARY KEY
deal_id UUID (FK deals)
agent_name VARCHAR (gemini, claude, consensus, paybot)
status VARCHAR (processing, complete)
progress INT (0-100)
decision VARCHAR (CUMPLIDO, INCUMPLIDO, PARTIAL)
confidence INT (0-100)
reasoning TEXT
started_at TIMESTAMP
completed_at TIMESTAMP
```

**payout_logs**
```sql
id UUID PRIMARY KEY
deal_id UUID (FK deals)
milestone_id UUID (FK milestones, nullable — solo si aplica)
role VARCHAR (payment, host_repair, guest_refund — default "payment")
tx_hash VARCHAR
amount_usdt FLOAT
recipient_wallet VARCHAR
status VARCHAR (pending, confirmed, failed)
error_message TEXT
created_at TIMESTAMP
confirmed_at TIMESTAMP
```

---

## API ENDPOINTS

### Authentication

```
POST /api/auth/whatsapp
Body: { whatsapp_number, display_name }
Response: { token, user_id, created: true/false }

Errors:
  400 - Invalid whatsapp_number
  500 - Database error
```

### Deals

```
POST /api/deals/create
Body: { service, amount_pen, description }
Response: { deal_id, status, share_link }

GET /api/deals/my-deals
Query: ?status=active&sort=created_at&limit=10
Response: [{ id, service, amount, status, created_at }, ...]

GET /api/deals/{id}
Response: {
  id, seller, buyer, service, amount,
  status, photos: [], payments: [],
  arbitration: {}, payout: {}
}

POST /api/deals/{id}/upload-photo
Body: FormData(photo, metadata)
Response: { ipfs_hash, metadata_saved: true }

POST /api/deals/{id}/accept
Body: {}
Response: { deal_id, status: "escrowed" }
```

### Kapso

```
POST /api/kapso/create-payment
Body: { deal_id, amount, user_phone }
Response: { payment_url, kapso_payment_id }

POST /api/kapso/webhook (Kapso llama a esto)
Body: { deal_id, amount, status, payment_id, timestamp }
Response: { ok }
  (Backend procesa y emite eventos)

GET /api/kapso/payment-status/{payment_id}
Response: { status, amount, confirmed_at }
```

### Arbitrage

```
POST /api/arbitrage/{id}/start
Body: {}
Response: { deal_id, arbitration_id, status: "processing" }

GET /api/arbitrage/{id}/status
Response: {
  arbitration_id,
  agents: {
    gemini: { progress, status, decision, confidence },
    claude: { progress, status, decision, confidence }
  },
  consensus: { status, verdict, votes }
}

WebSocket: /ws/arbitrage/{id}
Emits every 2 sec:
{
  type: "arbitration_progress",
  agents: {...},
  consensus: {...}
}
```

### Analytics

```
GET /api/analytics/earnings
Query: ?period=month (month|year|all)
Response: {
  total: 450.50,
  deals_count: 3,
  avg_per_deal: 150.17,
  data: [{ month, earnings }, ...]
}

GET /api/analytics/stats
Response: {
  total_earned: 450.50,
  deals_completed: 3,
  rating: 4.8,
  success_rate: 100,
  avg_time_to_payout: 25 (min)
}

GET /api/analytics/timeline
Response: [
  { date, event, amount, status },
  ...
]
```

### Withdraw

```
POST /api/withdraw/prepare
Body: { amount, method (kapso|internal), account_info }
Response: { withdraw_id, amount, method, 2fa_required: true }

POST /api/withdraw/confirm
Body: { withdraw_id, 2fa_code }
Response: { status: "processing", tx_hash }

GET /api/withdraw/status/{withdraw_id}
Response: { status, amount, confirmed_at }
```

---

## COMPONENTES PRINCIPALES

### 1. WhatsApp Bot Handlers

**create_deal.js**
- Conversación: Servicio → Precio → Descripción
- Guardar en backend
- Enviar link para compartir

**kapso_payment.js**
- Generar QR Kapso
- Enviar botón de pago
- Esperar confirmación webhook

**upload_photo.js**
- Recibir foto
- Extraer metadata (EXIF, GPS)
- Subir a Pinata
- Notificar backend

**view_dashboard.js**
- Enviar link: verify.app/deals/{id}
- Ver animación agents en vivo

### 2. Frontend Components

**AgentAnimation.tsx**
```jsx
<AgentCard
  name="Gemini"
  progress={45}
  status="Analyzing photos..."
  eta={8}
/>

<AgentCard
  name="Claude"
  progress={25}
  status="Processing metadata..."
  eta={12}
/>

<ConsensusBox
  votes_received={1}
  votes_needed={2}
  verdict={null}
/>

<PayBotCard
  status="Waiting for consensus"
  ready={false}
/>
```

**DealTable.tsx**
- Tabla con deals
- Filtros (status, fecha)
- Link a detail page

**DealDetail.tsx**
- Información del deal
- Galería de fotos
- WebSocket connection para animación en vivo
- Rating section

### 3. Backend Services

**deal_service.py**
- CRUD deals
- Update status
- Guardar fotos

**kapso_service.py**
- Cliente Kapso API
- Crear payment links
- Verificar webhooks

**genlayer_agent.py**
- Llamar Gemini API
- Llamar Claude API
- Implementar votación
- Emitir eventos WebSocket

**paybot_agent.py**
- Verificar guardrails
- Ejecutar WDK CLI
- Guardar transaction hash
- Audit logging

---

## SETUP INICIAL

### Prerequisitos

```bash
- Node.js 18+ (bot + frontend)
- Python 3.10+ (backend)
- PostgreSQL (Supabase)
- Git
- Docker (opcional)
```

### Paso 1: Clonar y Setup Base

```bash
git clone <repo>
cd verify-app

# Crear estructura
mkdir -p bot frontend backend contracts docs

# Install bot
cd bot
npm init -y
npm install express axios dotenv ws
cd ..

# Install frontend
cd frontend
npx create-next-app@latest . --typescript
npm install axios ws ws
cd ..

# Install backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-dotenv supabase websockets
cd ..
```

### Paso 2: Configurar Variables

```bash
# Copy .env templates
cp .env.example .env
cp bot/.env.example bot/.env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Editar con tus keys
# - WhatsApp Business API Token + Phone Number ID (Meta for Developers)
# - Kapso credentials
# - Supabase URL + keys
# - Gemini + Claude API keys
# - WDK CLI path
```

### Paso 3: Setup Supabase

```bash
# Crear project en supabase.com
# Copiar URL y keys a .env

# Ejecutar migrations (crear tablas)
# Ver scripts en docs/supabase-migrations.sql
```

### Paso 4: Deploy WhatsApp Bot

```bash
cd bot
npm start

# Esperar a que esté listo
# Probar: enviar "hola" al número de WhatsApp Business configurado
```

### Paso 5: Correr Backend

```bash
cd backend
source venv/bin/activate
python main.py

# Debe estar en http://localhost:8000
# Verificar: curl http://localhost:8000/health
```

### Paso 6: Correr Frontend

```bash
cd frontend
npm run dev

# Debe estar en http://localhost:3000
```

### Verificación

```bash
# Bot
curl http://localhost:8000/health

# Frontend
open http://localhost:3000

# API
curl http://localhost:8000/api/deals/my-deals
  (Debe retornar error 401 si no estás autenticado - OK)
```

---

## TESTING & DEPLOYMENT

### Testing Local

```bash
# Bot
curl -X POST http://localhost:8000/api/deals/create \
  -H "Content-Type: application/json" \
  -d '{"service": "Test", "amount": 100}'

# Frontend
Go to http://localhost:3000/dashboard
(Should show empty deals table)

# Arbitrage (mock)
curl -X POST http://localhost:8000/api/arbitrage/deal_test_id/start

# WebSocket
wscat -c ws://localhost:8000/ws
```

### Pre-Deployment Checklist

```
Backend:
✓ All endpoints return 200/201/400 as expected
✓ JWT validation works
✓ Kapso webhook signature verified
✓ GenLayer agents respond
✓ WDK CLI wrapper works
✓ Supabase connections OK
✓ Error logging works

Frontend:
✓ Dashboard loads
✓ Deal table updates with WebSocket
✓ AgentAnimation displays correctly
✓ Auth redirects to login
✓ Responsive on mobile

Bot:
✓ /start works
✓ /crear_deal conversation complete
✓ Kapso QR generates
✓ Photo upload works
✓ Notifications send

Blockchain:
✓ Deal.sol compiles
✓ Deployed to Avalanche Sepolia
✓ USDT transfers work
```

### Deployment

**Backend (Railway/Render)**
```bash
git push origin main
# CI/CD triggers deployment automatically
```

**Frontend (Vercel)**
```bash
npm run build
vercel deploy
```

**Bot (Heroku/Railway)**
```bash
git push heroku main
heroku logs -t
```

---

## NOTAS IMPORTANTES

### Seguridad

- ✅ JWT tokens válidos 30 días
- ✅ Refresh tokens en httpOnly cookies
- ✅ Kapso webhooks verificados con firma
- ✅ WDK private keys nunca en logs
- ✅ Rate limiting en endpoints públicos
- ✅ CORS restringido

### Performance

- ✅ WebSocket para actualizaciones en vivo (no polling)
- ✅ Caching de datos estáticos
- ✅ Índices en Supabase para queries frecuentes
- ✅ Compresión de imágenes antes de IPFS

### Escalabilidad

- ✅ Backend stateless (puede escalar horizontalmente)
- ✅ Bot stateless (webhook-driven)
- ✅ WebSocket con Redis (para múltiples instancias)
- ✅ Database con connection pooling

---

## REFERENCIAS RÁPIDAS

### Docs Externas

- WhatsApp Business Platform (Cloud API): https://developers.facebook.com/docs/whatsapp/cloud-api
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org/docs
- Solidity: https://docs.soliditylang.org
- Supabase: https://supabase.com/docs
- WDK Docs: https://docs.wdk.tether.io

### Test Data (Para mockear)

**Deal Mock**
```json
{
  "id": "deal_xyz789",
  "service": "Remodelación cocina completa",
  "amount": 12000,
  "status": "pending_buyer",
  "is_milestone_based": true,
  "seller": "constructora_test",
  "buyer": "cliente_test"
}
```

**Photo Mock**
```json
{
  "ipfs_hash": "QmXxxx...",
  "timestamp": "2024-08-23T15:20:00Z",
  "gps": { "lat": -12.0462, "lon": -77.0371 },
  "device": "iPhone 14 Pro"
}
```

---
