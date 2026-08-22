# Verity 🚀

**Sistema universal de garantía blockchain + Agente autónomo de pagos con WDK CLI**

> Transformar cualquier transacción P2P en un acuerdo garantizado, arbitrado por IA y ejecutado automáticamente.

---

## 📋 Tabla de Contenidos

- [Problema](#problema)
- [Público Objetivo](#público-objetivo)
- [Solución](#solución)
- [Características Principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Stack Tecnológico](#stack-tecnológico)
- [Casos de Uso](#casos-de-uso)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)

---

## Problema

### El mercado P2P en Latinoamérica carece de confianza sin intermediarios

En Perú y Latinoamérica, **$50B+ anuales** se transan entre individuos (Facebook Marketplace, servicios informales), pero **sin mecanismos de garantía descentralizados**:

- **iPhone usado**: ¿Funciona realmente? ¿Pantalla OK? Comprador tiene miedo.
- **Caución de alquiler**: Arrendador retiene dinero, inquilino demanda, años de litigio.
-  **Freelance internacional**: Dev espera 30 días por pago, cliente teme que nunca entregue.
- **Servicios**: ¿Cómo sabe el cliente que recibirá calidad antes de pagar?
- **Remesas**: Enviar dinero a familiares = comisiones, desconfianza, sin auditoría.

**Resultado**: Transacciones fracasan, dinero perdido, relaciones destruidas, usuarios usan intermediarios caros (MercadoPago cobra 6%).

---

## Público Objetivo

### Primaria (MVP)
1. **Compradores/vendedores P2P** en Perú, Colombia, Argentina, México
   - Edad: 18-50
   - Transacciones: $50-$3,000
   - Tech-savvy pero no expertos en cripto
   - Pain point: Desconfianza, pérdida de dinero

2. **Trabajadores informales**
   - Taxistas, tutores, plomeros, electricistas
   - 8M+ en Perú solo
   - No tienen acceso a sistemas bancarios formales
   - Usan Efectivo, temen ser estafados

3. **Propietarios e inquilinos**
   - Conflictos de caución
   - Market: ~2M apartamentos alquilados anuales en Latam

4. **Freelancers internacionales**
   - Developers, diseñadores, escritores
   - Temen non-payment en plataformas freelance

### Secundaria (Post-MVP)
- Medianas empresas (proveedores + comprador)
- Seguros descentralizados
- Préstamos P2P garantizados

---

## Solución

### TrustLayer: Sistema Universal de Garantía Blockchain

**Concepto core**: Cualquier acuerdo entre dos personas → dinero en escrow → si hay conflicto → GenLayer (IA) arbitra en 15 minutos → payout automático.

**Sin intermediario, sin comisión (o mínima), sin esperar abogados**.

#### Cómo funciona:

```
1. CREAR DEAL
   └─ Seller + Buyer acuerdan términos (descripción, monto, fotos)
   
2. DEPOSITAR EN ESCROW
   └─ Buyer transfiere dinero a Smart Contract
   └─ Dinero bloqueado, no accesible (trustless)
   
3. CUMPLIR ACUERDO
   └─ Seller entrega producto/servicio
   └─ Buyer sube fotos/evidencia de cumplimiento
   
4. ARBITRAJE (GenLayer)
   └─ 5 LLMs analizan en paralelo: "¿Se cumplió?"
   └─ Consenso: mayoría (3+/5) gana
   └─ Veredicto en 15 minutos
   
5. PAYOUT AUTOMÁTICO (PayBot + WDK CLI)
   └─ Backend detecta veredicto
   └─ PayBot aplica guardrails (whitelist, límites, auditoría)
   └─ Ejecuta `wdk send --to {winner} --amount {dinero}`
   └─ USDT llega automáticamente, sin intervención humana
   
6. SCORE ON-CHAIN
   └─ Ambos usuarios reciben rating permanente
   └─ Transparencia total, imposible de falsificar
```

### Diferenciadores

| Aspecto | TrustLayer | Marketplace (OLX) | Banco | PayPal |
|---------|-----------|------------------|-------|--------|
| **Arbitraje** | GenLayer (IA) | Humano (lento) | Abogado (30 días) | Desconocido |
| **Comisión** | 0% (MVP) | 5-10% | 2-5% | 2.9% + $0.30 |
| **Velocidad** | 15 min | — | 1-3 meses | 1-3 días |
| **Transfronterizo** | ✅ USDT | ❌ | ⚠️ | ✅ pero caro |
| **Transparencia** | 100% on-chain | ❌ | ❌ | ❌ |
| **Descentralizado** | ✅ | ❌ | ❌ | ❌ |

---

## Características Principales

### TrustLayer (Escrow + Arbitraje)
- ✅ Crear deals (descripción, monto, fotos IPFS)
- ✅ Escrow Smart Contract (Avalanche C-Chain)
- ✅ Subir evidencia (fotos, videos)
- ✅ GenLayer arbitrage (5 LLMs voting)
- ✅ Rating on-chain (permanente, inmutable)
- ✅ Dashboard de historial

### PayBot (Agente WDK CLI)
- ✅ Agente detecta veredicto automáticamente
- ✅ Guardrails de seguridad:
  - Whitelist de recipientes
  - Spending cap ($1,000 por transacción)
  - Daily limit ($5,000 por día)
  - Confirmación manual para montos > $500
- ✅ WDK CLI: `wdk send --to {addr} --amount {amt} --json`
- ✅ Audit logs completos (JSON receipt)
- ✅ Transacciones paralelas (batch payouts)

### Casos de Uso Soportados

1. **Compra de usados** (iPhone, moto, laptop)
   - Escrow $100-$3,000
   - Fotos + GenLayer valida estado
   - Payout en 20 minutos

2. **Servicios** (tutor, plomero, electricista)
   - Depósito $20-$200
   - Foto resultado → GenLayer valida
   - Pago automático

3. **Alquiler** (caución departamento)
   - Escrow $500-$5,000 por 12 meses
   - Fotos final → GenLayer calcula daños
   - Payout proporcional (ej: 90% inquilino, 10% dueño)

4. **Freelance/Outsourcing**
   - Escrow $500-$10,000
   - Entrega código + deploy
   - GenLayer valida funcionalidad
   - Pago garantizado (sin esperar 30 días)

5. **Remesas**
   - Sender deposita USDT
   - Receiver recibe sin comisión (paymaster cubre)
   - Score on-chain para historial

---

## Arquitectura

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Next.js 14)                              │
│  - Deal creation form                               │
│  - Status dashboard                                 │
│  - Arbitrage results                                │
│  - Payout notifications                             │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│  Backend (FastAPI + Python)                         │
│  - Deal management API                              │
│  - GenLayer trigger                                 │
│  - PayBot orchestration                             │
│  - Audit logs                                       │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│  WDK CLI + Wallets (Node.js)     ◄◄ CORE TRACK 1    │
│  - Create/import wallets                            │
│  - Check balances                                   │
│  - Send USDT (guardrails)                           │
│  - JSON output (auditable)                          │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│  Smart Contracts (Solidity)                         │
│  - Deal.sol: Escrow, state machine, veredicto       │
│  - Deployment: Avalanche Sepolia                    │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│  GenLayer (Python + Gemini + Claude)                │
│  - 5 LLMs voting in parallel                        │
│  - Image analysis                                   │
│  - Consensus logic                                  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│  Data + Blockchain                                  │
│  - Supabase: deals, images, scores, audit logs      │
│  - Avalanche: USDT, Deal.sol state                  │
│  - IPFS (Pinata): Deal images                       │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
User (Seller/Buyer)
  ↓
Frontend (Next.js)
  ├→ Create deal form
  ├→ Upload images (IPFS via Pinata)
  └→ Accept/complete delivery
  ↓
FastAPI Backend
  ├→ Validate deal
  ├→ Interact with Smart Contract (escrow)
  ├→ Trigger GenLayer when needed
  └→ Invoke PayBot on veredicto
  ↓
GenLayer (Python)
  ├→ Parse images from IPFS
  ├→ Call Gemini (real vote)
  ├→ Call Claude (real vote)
  ├→ Mock votes (3 votes)
  ├→ Consensus majority
  └→ Return veredicto
  ↓
PayBot Agent (Python + WDK CLI)
  ├→ Check guardrails (whitelist, caps, limits)
  ├→ Execute: wdk send --to {winner} --amount {amt} --json
  ├→ Store audit log in Supabase
  └→ Return receipt to backend
  ↓
Smart Contract (Avalanche)
  ├→ Escrow locked/unlocked
  ├→ USDT transferred
  └→ Events emitted
  ↓
Frontend (Update)
  └→ Show "Payment complete ✓"
```

---

## Estructura del Repositorio

```
verity/
│
├── README.md                          # Este archivo
├── .env.example                       # Template de variables
├── .gitignore
│
├── frontend/                          # Next.js 14 + React
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing
│   │   ├── deals/
│   │   │   ├── page.tsx               # List deals
│   │   │   ├── create/
│   │   │   │   └── page.tsx           # Deal creation form
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Deal detail
│   │   │       └── complete/
│   │   │           └── page.tsx       # Delivery complete form
│   │   ├── dashboard/
│   │   │   └── page.tsx               # User dashboard
│   │   └── api/
│   │       └── [...routes]            # Client-side API calls
│   ├── components/
│   │   ├── DealForm.tsx
│   │   ├── DealCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ...
│   ├── styles/
│   │   └── globals.css
│   ├── lib/
│   │   ├── api.ts                     # API client
│   │   └── utils.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                           # FastAPI + Python
│   ├── main.py                        # FastAPI app entry
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                  # Config, env vars
│   │   ├── models.py                  # Pydantic models
│   │   │
│   │   ├── routers/
│   │   │   ├── deals.py               # POST /deals, GET /deals/{id}
│   │   │   ├── images.py              # POST /deals/{id}/images
│   │   │   ├── arbitrage.py           # POST /deals/{id}/arbitrate
│   │   │   └── payouts.py             # POST /deals/{id}/execute_payout
│   │   │
│   │   ├── services/
│   │   │   ├── deal_service.py        # Deal logic
│   │   │   ├── image_service.py       # IPFS upload
│   │   │   ├── genlayer_service.py    # GenLayer orchestration
│   │   │   ├── paybot_service.py      # PayBot + WDK CLI integration
│   │   │   └── blockchain_service.py  # Smart contract interaction
│   │   │
│   │   ├── agents/
│   │   │   ├── paybot_agent.py        # PayBot class
│   │   │   ├── genlayer_agent.py      # GenLayer voting logic
│   │   │   └── wdk_cli_wrapper.py     # WDK CLI subprocess caller
│   │   │
│   │   └── db/
│   │       └── supabase_client.py     # Supabase DB operations
│   │
│   └── tests/
│       ├── test_deals.py
│       ├── test_paybot.py
│       └── test_genlayer.py
│
├── contracts/                         # Solidity Smart Contracts
│   ├── hardhat.config.js              # Hardhat configuration
│   ├── .env.example
│   │
│   ├── contracts/
│   │   ├── Deal.sol                   # Main escrow contract
│   │   └── interfaces/
│   │       └── IERC20.sol             # USDT interface
│   │
│   ├── scripts/
│   │   ├── deploy.js                  # Deploy Deal.sol to Avalanche
│   │   └── verify.js                  # Verify on explorer
│   │
│   ├── test/
│   │   └── Deal.test.js               # Contract tests
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # Detailed architecture
│   ├── API.md                         # API endpoints
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── WDK_INTEGRATION.md             # WDK CLI usage details
│   ├── GENLAYER.md                    # GenLayer + LLM voting
│   ├── USE_CASES.md                   # Detailed use cases
│   └── DEMO_SCRIPT.md                 # Demo video script
│
└── docker-compose.yml                 # Local development (optional)
```

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **Blockchain**: wagmi + viem (optional, for wallet display)
- **Upload**: react-dropzone + Pinata SDK
- **State**: React hooks + Context API
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **Language**: Python
- **Async**: asyncio, aiohttp
- **Database**: Supabase (PostgreSQL)
- **AI/LLM**: 
  - Gemini API (image analysis, voting)
  - Claude API (voting, analysis)
  - OpenAI API (optional, voting)
- **Blockchain**: Web3.py
- **WDK Integration**: @tetherto/wdk-cli (subprocess)
- **IPFS**: Pinata SDK
- **Deployment**: Railway / Render

### Blockchain
- **Network**: Avalanche C-Chain (Sepolia testnet)
- **Smart Contract Language**: Solidity 0.8.20
- **Contract Tool**: Hardhat
- **Token**: USDT (ERC-20 mock)
- **Libraries**: OpenZeppelin Contracts

### GenLayer (AI Arbitrage)
- **Primary LLM**: Gemini 1.5 Flash (free tier, $0)
- **Secondary LLM**: Claude 3.5 Sonnet (~$0.05-0.10 per arbitrage)
- **Tertiary**: OpenAI GPT-4 (optional, ~$0.30 per arbitrage)
- **Image Processing**: Vision capabilities of each LLM
- **Orchestration**: Python asyncio (parallel voting)

### WDK (Track 1 Core)
- **CLI**: @tetherto/wdk-cli (npm install -g)
- **SDK**: @tetherto/wdk (Node.js)
- **Integration**: Python subprocess → CLI invocation
- **Network**: Avalanche C-Chain + Solana + EVM chains
- **Output**: JSON (--json flag for auditable receipts)

### Database
- **Primary**: Supabase (PostgreSQL)
- **Tables**: 
  - deals (id, seller, buyer, amount, status, veredicto)
  - images (id, deal_id, ipfs_hash, uploaded_by, created_at)
  - users (id, wallet_address, username, score, created_at)
  - payouts (id, deal_id, tx_hash, status, amount, recipient)
  - audit_logs (id, action, agent, timestamp, details)

### Infrastructure
- **Frontend Hosting**: Vercel (automatic deployments from git)
- **Backend Hosting**: Railway / Render (Docker support)
- **Database Hosting**: Supabase Cloud
- **IPFS Gateway**: Pinata
- **API Rate Limiting**: Built-in (FastAPI)
- **Monitoring**: Sentry (optional)

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (tests, linting)
- **Local Dev**: Docker Compose (optional)
- **Package Manager**: npm (frontend), pip (backend)
- **Linting**: ESLint (frontend), pylint (backend)
- **Testing**: Pytest (backend), Jest (frontend)

---

## Casos de Uso

### 1. Compra de iPhone ($300)

**Actores**: Juana (vendedora), Carlos (comprador)

**Flujo**:
1. Juana crea deal: "iPhone 13, 256GB, buena condición, $300"
2. Carlos acepta y deposita $300 en escrow
3. Juana envía el teléfono
4. Carlos recibe y sube 3 fotos: teléfono encendido, pantalla, batería
5. GenLayer analiza: "¿Funciona? ¿Pantalla OK? ¿Batería OK?" → 5 LLMs votan → 5/5 CUMPLIDO
6. PayBot (WDK CLI) detecta veredicto → paga $300 a Juana automáticamente
7. Ambos reciben score 5/5 on-chain

**Duración**: Deal completo en 2-3 horas, arbitraje en 15 minutos

---

### 2. Caución de Alquiler ($1,000, 12 meses)

**Actores**: Arrendador, Inquilino

**Flujo**:
1. Arrendador crea deal: "Caución departamento 3 habitaciones, $1,000, 365 días"
2. Inquilino deposita $1,000 en escrow (bloqueado 12 meses)
3. Inquilino vive en apartamento
4. Día 365: Inquilino se muda y sube fotos estado final
5. GenLayer analiza: "¿Daño normal o destructivo?" → calcula % → "90% normal, 10% destructivo"
6. PayBot (WDK CLI) ejecuta doble payout:
   - $900 → Inquilino
   - $100 → Arrendador
7. Ambos reciben score proporcional

**Ventaja**: Sin juicio, sin abogado, en 20 minutos

---

### 3. Servicios (Tutoría, $50/clase)

**Actores**: Carlos (tutor), Ana (estudiante)

**Flujo**:
1. Carlos crea deal: "1 hora clase Matemáticas, $50"
2. Ana deposita $50
3. Clase sucede en Zoom (fuera de app)
4. Ana sube foto: pizarra con ejercicios resueltos
5. GenLayer: "¿Ejercicios correctos? ¿Explicación clara?" → 5/5 CUMPLIDO
6. PayBot → $50 a Carlos automáticamente
7. Puede repetirse cada semana (4 deals/mes, 4 pagos automáticos)

---

### 4. Freelance (Desarrollo Web, $2,000)

**Actores**: Dev (Chile), Cliente (Perú)

**Flujo**:
1. Dev crea deal: "Sitio 5 páginas responsive, $2,000"
2. Cliente deposita $2,000
3. Dev desarrolla 2 semanas
4. Dev entrega: GitHub repo + URL viva + screenshot responsive
5. GenLayer: "¿Funciona? ¿Responsive? ¿Rápido?" → accede URLs, valida → 5/5 CUMPLIDO
6. PayBot → $2,000 a Dev instantáneamente (sin esperar 30 días)

**Ventaja**: Dev no pierde dinero, Cliente garantiza calidad

---

## Getting Started

### Requisitos previos
- Node.js 18+
- Python 3.10+
- Git
- API keys:
  - Gemini API (free)
  - Claude API (paid, ~$0.05-0.10 per demo)
  - Supabase account (free tier)
  - Pinata account (free tier)

### Setup local (5 minutos)

```bash
# 1. Clonar repo
git clone https://github.com/tu-usuario/trustlayer-paybot.git
cd trustlayer-paybot

# 2. Setup environment
cp .env.example .env.local
# Editar .env.local con tus keys

# 3. Frontend
cd frontend
npm install
npm run dev
# Abre http://localhost:3000

# 4. Backend (en otra terminal)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
# Abre http://localhost:8000/docs

# 5. Smart Contract (en otra terminal)
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network avalanche-sepolia
# Guarda el DEAL_CONTRACT_ADDRESS en .env
```

### Verificar que todo funciona

```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health

# Test WDK CLI (desde terminal)
wdk wallet create --json
```

---

## Roadmap

### MVP (Hackathon Aleph, 22-23 Agosto 2026)
- ✅ Verity core (create deal, escrow, arbitrage)
- ✅ PayBot + WDK CLI integration
- ✅ GenLayer with Gemini + Claude + mocks
- ✅ Frontend basic (form, dashboard, results)
- ✅ Demo video (90 seg, 2 casos)

### V1 (Post-hackathon, Sep 2026)
- [ ] Deploy to mainnet (Avalanche C-Chain)
- [ ] Mobile app (React Native)
- [ ] Email/SMS notifications
- [ ] Dispute resolution (community voting)
- [ ] Payment method options (credit card, bank transfer)

### V2 (Q4 2026)
- [ ] Multi-language (Spanish, Portuguese)
- [ ] Regional expansion (Colombia, Argentina, México)
- [ ] Insurance integration (smart contract coverage)
- [ ] Subscription payouts (recurring deals)
- [ ] API for marketplaces (OLX, Mercado Libre)

### V3 (2027+)
- [ ] Cross-chain bridges (Polygon, Arbitrum, Solana)
- [ ] DAO governance (community votes on arbitrage)
- [ ] Tokenomics (rewards for good actors)
- [ ] Institutional deals (B2B escrow)

---

## Contribuciones

Contributions welcome! Por favor:
1. Fork el repo
2. Crea una branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## Licencia

MIT License - See `LICENSE` file for details

---

## Contacto

- **Email**: team@trustlayer.io
- **Twitter**: [@TrustLayerIO](https://twitter.com/trustlayerio)
- **Discord**: [Join our community](https://discord.gg/trustlayer)
- **Docs**: https://docs.trustlayer.io

---

## Agradecimientos

- **Tether** (WDK Track sponsor)
- **Aleph Hackathon** 

---

**Built with ❤️ for trust in Latam**

*Last updated: August 22, 2026*
