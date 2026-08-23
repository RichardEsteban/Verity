# backend/

API de Verify (FastAPI). Backend de demo: corre 100% en memoria (sin base de
datos ni APIs externas) para poder mostrar el flujo completo sin credenciales.

Kapso, GenLayer (Gemini + Claude) e IPFS estan simulados con la misma forma
de API/respuesta que tendrian en produccion (ver comentarios en
`app/services/kapso_service.py`, `app/agents/genlayer_agent.py` y
`app/services/image_service.py`), para poder reemplazarlos por las
integraciones reales sin tocar los routers.

**WDK si es real** (`app/agents/wdk_cli_wrapper.py`): los payouts son
transacciones de verdad en Sepolia testnet, via el CLI oficial
`@tetherto/wdk-cli`. Sin las variables de WDK en `.env`, los payouts fallan
con un error claro en vez de fingir una transaccion.

### Setup de WDK (una sola vez)

**Opcion rapida (recomendada para probar):** usa la wallet de demo ya
provista, con el token de prueba ya deployado -- ver la seccion
["Payment Verification"](../README.md#payment-verification)
del README raiz. Es solo importar el seed phrase, unlock, registrar el
token, y completar `backend/.env`.

**Opcion desde cero (tu propia wallet):**

```bash
npm install -g @tetherto/wdk-cli   # Node >= 22.18.0
# IMPORTANTE: abre una terminal nueva despues de este install, o el
# comando `wdk` de abajo no se va a encontrar aunque la instalacion haya
# funcionado (el PATH se actualiza a nivel de sistema, no de la terminal
# que ya tenias abierta).

# Crear la wallet del backend (queda encriptada en ~/.config/wdk-cli/)
export WDK_PASSPHRASE="elige-una-passphrase"
wdk wallet create --name verify --words 12 --json
wdk wallet unlock --name verify --ttl 0

# Conseguir Sepolia ETH de testnet (gas) para la direccion que imprimio create:
wdk get address --network sepolia --json
# fondeala en https://faucets.chain.link/sepolia o https://faucet.quicknode.com/ethereum/sepolia
```

Luego desplega tu propio token de prueba (ver [`../contracts`](../contracts)) y
registralo:

```bash
cd ../contracts && npm install && cp .env.example .env
# pega la private key de esa misma wallet en DEPLOYER_PRIVATE_KEY
npm run deploy
# copia la direccion que imprime

wdk token add '{"network":"sepolia","token":"musdt","symbol":"USDT","decimals":6,"isNative":false,"address":"<direccion del deploy>"}'
```

Completa `backend/.env` con `WDK_WALLET_NAME=verify`, `WDK_PASSPHRASE=...`,
`WDK_NETWORK=sepolia`, `WDK_TOKEN=musdt`.

Probado de punta a punta con transacciones reales minadas en Sepolia, ej.
[`0x65cb292a...988613`](https://sepolia.etherscan.io/tx/0x65cb292a20b26e2df039a749b8b16ee4d79cde37b526a7fe84e63932c9988613)
y [`0xb3b540a6...1ac160`](https://sepolia.etherscan.io/tx/0xb3b540a6913d1fe909527b9a46ffb37ffe3ee23cb3739ea458b15da1da1ac160)
(esta ultima disparada desde el dashboard, via el WebSocket real de
`/dashboard/deals/[id]/live`).

## Correr localmente

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Server en `http://localhost:8000`. Docs interactivas en `/docs`.

## Correr los tests

```bash
pytest -v
```

## Flujo de demo (curl)

```bash
# 1. Auth
curl -X POST http://localhost:8000/api/auth/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number":"+51999999999","display_name":"Juan"}'
# guarda el "token" de la respuesta

# 2. Crear deal (usa el token como Bearer)
curl -X POST http://localhost:8000/api/deals/create \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"service_description":"Reparar caneria","amount_pen":150}'
# guarda el "deal_id"

# 3. Simular confirmacion de pago (webhook Kapso)
curl -X POST http://localhost:8000/api/kapso/webhook \
  -H "Content-Type: application/json" \
  -d '{"deal_id":"<deal_id>","amount":150,"status":"confirmed","payment_id":"kapso_1"}'

# 4. Subir evidencia
curl -X POST http://localhost:8000/api/deals/<deal_id>/upload-photo \
  -H "Authorization: Bearer <token>" \
  -F "photo=@foto.jpg"

# 5. Arbitrar (dispara GenLayer simulado + un payout real via WDK)
curl -X POST http://localhost:8000/api/arbitrage/<deal_id>/start
```
