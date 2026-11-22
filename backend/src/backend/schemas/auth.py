
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Datos para registrar un usuario
class RegistroRequest(BaseModel):

    nombre: str = Field(min_length=2, max_length=80)
    apellido: str = Field(min_length=2, max_length=80)
    correo: EmailStr
    telefono: str = Field(min_length=7, max_length=15)
    rol: Literal["postulante", "empresa"]
    contrasena: str = Field(min_length=8, max_length=64)


# Datos para iniciar sesión
class LoginRequest(BaseModel):

    correo: EmailStr
    contrasena: str


# Datos del usuario que se pueden mostrar
class UsuarioPublico(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    correo: EmailStr
    telefono: str
    rol: Literal["postulante", "empresa", "admin"]
