"""Repositorio SQL Server de postulaciones."""
from backend.repositories.sql import SqlRepository
from backend.schemas.postulaciones import PostulacionPublica

class PostulacionesRepository(SqlRepository):
    tabla = "postulaciones"
    modelo = PostulacionPublica
    duplicado = "Ya existe una postulación a esta oferta"

    def buscar_por_oferta_y_usuario(self, oferta_id: int, usuario_id: int) -> PostulacionPublica | None:
        return self._obtener("[oferta_id] = ? AND [usuario_id] = ?", (oferta_id, usuario_id))

    def agregar(self, datos: dict) -> PostulacionPublica:
        return self._agregar(datos)

    def obtener(self, postulacion_id: int) -> PostulacionPublica | None:
        return self._obtener("[id] = ?", (postulacion_id,))

    def listar_por_usuario(self, usuario_id: int) -> list[PostulacionPublica]:
        return self._listar("[usuario_id] = ?", (usuario_id,))

    def listar_por_oferta(self, oferta_id: int) -> list[PostulacionPublica]:
        return self._listar("[oferta_id] = ?", (oferta_id,))

    def cambiar_estado(self, postulacion_id: int, estado: str) -> PostulacionPublica:
        return self._actualizar(postulacion_id, {'estado': estado})
