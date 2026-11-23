from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

EstadoPostulacion = Literal["enviada", "en_revision", "aceptada", "rechazada"]

class PostulacionCrear(BaseModel):
    mensaje: str = Field(default="", max_length=1200)

class PostulacionEstado(BaseModel):
    estado: EstadoPostulacion

class PostulacionPublica(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    oferta_id: int
    mensaje: str
    estado: EstadoPostulacion
    fecha_postulacion: datetime
