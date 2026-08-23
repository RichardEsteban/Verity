"""Wrapper real de `@tetherto/wdk-cli` (el CLI oficial de WDK, instalado
globalmente con `npm install -g @tetherto/wdk-cli`). No es una simulacion:
la wallet, la red y el token son reales (Sepolia testnet) -- ver
backend/README.md ("Setup de WDK") para el setup completo.

Nota: en Windows, `wdk` a veces termina con un crash de libuv al cerrar el
proceso (un bug conocido del daemon) *despues* de escribir el JSON de
resultado en stdout, lo que deja un returncode != 0 en un comando que en
realidad funciono. Por eso la deteccion de exito se basa en si stdout trae
un `txHash` valido, no solo en el returncode.
"""

import asyncio
import json
import os
import shutil

from app.config import get_settings


class WdkSendError(RuntimeError):
    pass


async def send_usdt(recipient_wallet: str, amount_usdt: float) -> str:
    settings = get_settings()
    if not settings.wdk_wallet_name or not settings.wdk_passphrase:
        raise WdkSendError(
            "WDK_WALLET_NAME / WDK_PASSPHRASE no configurados. Ver backend/README.md (\"Setup de WDK\")"
        )

    # En Windows el global de npm instala wdk.cmd (shim) + un `wdk` extra sin
    # extension (script POSIX para git-bash) -- shutil.which("wdk") a veces
    # resuelve ese ultimo, que CreateProcess no puede ejecutar directo. Se
    # pide el .cmd explicito primero.
    wdk_path = shutil.which("wdk.cmd") or shutil.which("wdk")
    if wdk_path is None:
        raise WdkSendError("No se encontro el comando 'wdk' en el PATH. Corre: npm install -g @tetherto/wdk-cli")

    env = {**os.environ, "WDK_PASSPHRASE": settings.wdk_passphrase}
    process = await asyncio.create_subprocess_exec(
        wdk_path,
        "send",
        "--network",
        settings.wdk_network,
        "--to",
        recipient_wallet,
        "--amount",
        str(amount_usdt),
        "--token",
        settings.wdk_token,
        "--wallet",
        settings.wdk_wallet_name,
        "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=env,
    )
    stdout, stderr = await process.communicate()

    try:
        result = json.loads(stdout.decode().strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        raise WdkSendError(stderr.decode().strip() or stdout.decode().strip() or "wdk send fallo sin salida")

    if "txHash" not in result:
        raise WdkSendError(result.get("error") or f"wdk send no devolvio txHash: {result}")

    return result["txHash"]
