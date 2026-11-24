"""Seguridad exclusivamente para la demostración sin base de datos."""
import os
from datetime import datetime, timedelta, timezone
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

_hasher = PasswordHasher()
DURACION_TOKEN = 60 * 60  # 1 hora

def hash_password(contrasena: str) -> str:
    return _hasher.hash(contrasena)

def verify_password(contrasena: str, contrasena_hash: str) -> bool:
    try:
        return _hasher.verify(contrasena_hash, contrasena)
    except (VerificationError, InvalidHashError):
        return False

def _clave() -> str:
    return os.environ.get("JWT_SECRET", "CHAMBAFAST_SOLO_DEMO_NO_USAR_EN_PRODUCCION_2026")

def create_access_token(usuario_id: int) -> tuple[str, int]:
    ahora = datetime.now(timezone.utc)
    datos = {"sub": str(usuario_id), "iat": ahora, "exp": ahora + timedelta(seconds=DURACION_TOKEN)}
    return jwt.encode(datos, _clave(), algorithm="HS256"), DURACION_TOKEN

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, _clave(), algorithms=["HS256"], options={"require": ["sub", "exp"]})
