from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

Rol = Literal["postulante", "empresa", "admin"]

class RegistroRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    apellido: str = Field(min_length=2, max_length=80)
    correo: EmailStr
    telefono: str = Field(min_length=7, max_length=15)
    rol: Literal["postulante", "empresa"]
    contrasena: str = Field(min_length=8, max_length=64)

class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str

class UsuarioConHash(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    apellido: str
    correo: EmailStr
    telefono: str
    rol: Rol
    contrasena_hash: str
    activo: bool = True

class UsuarioPublico(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    apellido: str
    correo: EmailStr
    telefono: str
    rol: Rol
    activo: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    usuario: UsuarioPublico

class CambiarEstadoUsuario(BaseModel):
    activo: bool
