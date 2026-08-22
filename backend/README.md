# backend/

API de Verify (FastAPI). Backend de demo: corre 100% en memoria (sin base de
datos ni APIs externas) para poder mostrar el flujo completo sin credenciales.

Kapso, GenLayer (Gemini + Claude) y WDK estan simulados con la misma forma
de API/respuesta que tendrian en produccion (ver comentarios en
`app/services/kapso_service.py`, `app/agents/genlayer_agent.py` y
`app/agents/wdk_cli_wrapper.py`), para poder reemplazarlos por las
integraciones reales sin tocar los routers.

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

# 5. Arbitrar (dispara GenLayer + PayBot simulados)
curl -X POST http://localhost:8000/api/arbitrage/<deal_id>/start
```
