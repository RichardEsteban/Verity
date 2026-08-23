# contracts/

`MockUSDT.sol` — un ERC-20 de 6 decimales (mismo estandar que el USDT real)
para poder mostrar transferencias reales via WDK en Avalanche Fuji testnet,
ya que el USDT oficial de Tether no esta desplegado en esa testnet.

No usa Hardhat: se compila con `solc` y se despliega con `ethers` directo,
en un solo script (`scripts/deploy.mjs`) — mas simple para un contrato chico
como este.

`Deal.sol` / `KapsoGateway.sol` (el escrow on-chain completo descrito en el
README raiz) siguen sin implementar; el backend de la demo no los necesita
todavia porque el escrow se maneja en la base de datos, no on-chain.

## Deploy

```bash
npm install
cp .env.example .env
# completa DEPLOYER_PRIVATE_KEY con la private key de la wallet de WDK
# (backend/wdk_bridge/README.md explica como generarla y fondearla)
npm run deploy
```

Imprime la direccion del contrato deployado y un link a
[testnet.snowtrace.io](https://testnet.snowtrace.io). Copia esa direccion a
`backend/.env` como `USDT_CONTRACT_ADDRESS`.
