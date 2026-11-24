from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

CategoriaEmprendimiento = Literal["Alimentos", "Ropa y accesorios", "Tecnología", "Belleza", "Servicios", "Artesanía"]
TipoNegocio = Literal["Productos", "Servicios", "Ambos"]
EstadoPublicacion = Literal["publicado", "oculto"]
TipoArticulo = Literal["producto", "servicio"]

class EmprendimientoCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    categoria: CategoriaEmprendimiento
    descripcion: str = Field(min_length=15, max_length=2500)
    ubicacion: str = Field(min_length=2, max_length=120)
    tipo: TipoNegocio
    contacto: str = Field(min_length=5, max_length=120)

class EmprendimientoActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    categoria: CategoriaEmprendimiento | None = None
    descripcion: str | None = Field(default=None, min_length=15, max_length=2500)
    ubicacion: str | None = Field(default=None, min_length=2, max_length=120)
    tipo: TipoNegocio | None = None
    contacto: str | None = Field(default=None, min_length=5, max_length=120)

class EmprendimientoPublico(EmprendimientoCrear):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    estado: EstadoPublicacion
    fecha_publicacion: datetime

class ProductoServicioCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    tipo: TipoArticulo
    descripcion: str = Field(min_length=5, max_length=2000)
    precio: str = Field(default="", max_length=80)

class ProductoServicioActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    tipo: TipoArticulo | None = None
    descripcion: str | None = Field(default=None, min_length=5, max_length=2000)
    precio: str | None = Field(default=None, max_length=80)

class ProductoServicioPublico(ProductoServicioCrear):
    model_config = ConfigDict(from_attributes=True)
    id: int
    emprendimiento_id: int
    estado: EstadoPublicacion
