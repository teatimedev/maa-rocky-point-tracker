from __future__ import annotations

import hashlib
from dataclasses import dataclass


@dataclass(slots=True)
class ImageUploadResult:
    source_url: str
    content_hash: str
    storage_path: str


def hash_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()
