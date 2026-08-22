"""Sube evidencia fotografica. En la demo no llama a Pinata: genera un hash
determinista a partir del contenido, con la forma de un CID de IPFS."""

import hashlib


def upload_to_pinata(content: bytes) -> str:
    digest = hashlib.sha256(content).hexdigest()[:44]
    return f"Qm{digest}"
