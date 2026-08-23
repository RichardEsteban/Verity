#!/bin/sh
set -e

# Importa y desbloquea la wallet de WDK al arrancar el contenedor -- el
# storage de `wdk` no persiste entre deploys de Railway, asi que esto se
# repite en cada boot. Requiere WDK_SEED ademas de las variables que ya lee
# app/config.py (WDK_WALLET_NAME, WDK_PASSPHRASE, WDK_NETWORK, WDK_TOKEN).
if [ -n "$WDK_SEED" ] && [ -n "$WDK_PASSPHRASE" ] && [ -n "$WDK_WALLET_NAME" ]; then
  export WDK_PASSPHRASE
  echo "$WDK_SEED" | wdk wallet import --name "$WDK_WALLET_NAME" --seed-stdin || true
  wdk wallet unlock --name "$WDK_WALLET_NAME" --ttl 0
  if [ -n "$WDK_TOKEN_ADDRESS" ]; then
    wdk token add "{\"network\":\"${WDK_NETWORK:-sepolia}\",\"token\":\"${WDK_TOKEN:-musdt}\",\"symbol\":\"USDT\",\"decimals\":6,\"isNative\":false,\"address\":\"$WDK_TOKEN_ADDRESS\"}" || true
  fi
else
  echo "WDK_SEED / WDK_PASSPHRASE / WDK_WALLET_NAME no configurados -- los payouts via WDK fallaran (ver README)."
fi

exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
