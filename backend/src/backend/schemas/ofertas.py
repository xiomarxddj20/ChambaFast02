from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

CategoriaOferta = Literal["Administración", "Tecnología", "Ventas", "Atención al cliente", "Marketing", "Diseño"]
Modalidad = Literal["Presencial", "Remoto", "Híbrido"]
EstadoOferta = Literal["publicada", "cerrada"]

class OfertaCrear(BaseModel):
    cargo: str = Field(min_length=3, max_length=120)
    empresa: str = Field(min_length=2, max_length=120)
    categoria: CategoriaOferta
    descripcion: str = Field(min_length=15, max_length=4000)
    requisitos: str = Field(min_length=10, max_length=4000)
    ubicacion: str = Field(min_length=2, max_length=120)
    modalidad: Modalidad
    salario: str = Field(default="", max_length=100)

class OfertaActualizar(BaseModel):
    cargo: str | None = Field(default=None, min_length=3, max_length=120)
    empresa: str | None = Field(default=None, min_length=2, max_length=120)
    categoria: CategoriaOferta | None = None
    descripcion: str | None = Field(default=None, min_length=15, max_length=4000)
    requisitos: str | None = Field(default=None, min_length=10, max_length=4000)
    ubicacion: str | None = Field(default=None, min_length=2, max_length=120)
    modalidad: Modalidad | None = None
    salario: str | None = Field(default=None, max_length=100)

class OfertaPublica(OfertaCrear):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    estado: EstadoOferta
    fecha_publicacion: datetime
