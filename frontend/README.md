# frontend/

Web Dashboard (Next.js 16, App Router). Login, deals, evidencia, arbitraje en
vivo (WebSocket real), analytics y retiro, conectados al [backend](../backend).

El modelo de datos completo (hitos, depósitos estilo Airbnb) sigue documentado
en el README raíz, pero el backend de la demo solo implementa el flujo simple
de un pago único — el frontend lo refleja: `deal_type` siempre es `"service"`,
`milestones`/`ratings` siempre vienen vacíos. El adaptador que hace ese mapeo
vive en [`app/lib/verify/api.ts`](app/lib/verify/api.ts).

## Correr localmente

Con el [backend](../backend) corriendo en `http://localhost:8000`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dashboard en `http://localhost:3000`.

## Flujo de demo

1. `/login` — entra con el mismo número de WhatsApp que usaste en el
   [bot](../bot) (o cualquiera; si no existe, el backend lo crea al vuelo).
2. `/dashboard` y `/dashboard/deals` — deals reales del usuario logueado.
3. `/dashboard/deals/[id]` — detalle real: vendedor, evidencia (IPFS hash),
   pagos.
4. `/dashboard/deals/[id]/live` — conecta a `/ws/arbitrage/{id}` y dispara
   `POST /api/arbitrage/{id}/start`; Gemini, Claude, consensus y el payout de
   PayBot se ven en vivo tal cual los emite el backend (no es una animación
   simulada).
5. `/dashboard/withdraw` — llama a `/api/withdraw/prepare` y `/confirm`.
6. `/deals/[id]` y `/deals/[id]/live` — vista pública sin login, el link que
   manda el bot (`share_link`).

## Nota sobre el código heredado

Este frontend se subió originalmente con un puñado de archivos de otro
proyecto (un template Web3 de recomendación de NFTs — wagmi, RainbowKit,
`dripMatchRegistryAbi.ts`, etc.) mezclados con las páginas reales de Verify.
Esos archivos no estaban importados por ninguna pantalla real y se
eliminaron al integrar esta rama; si ves referencias a "creators" o "NFTs"
en el historial de git, es de ahí.
