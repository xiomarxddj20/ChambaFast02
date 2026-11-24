"""Repositorio SQL Server de ofertas laborales."""
from backend.repositories.sql import SqlRepository
from backend.schemas.ofertas import OfertaPublica

class OfertasRepository(SqlRepository):
    tabla = "ofertas"
    modelo = OfertaPublica

    def listar_publicadas(self, categoria: str | None) -> list[OfertaPublica]:
        condicion = "[estado] = ?"
        parametros = ("publicada",)
        if categoria is not None:
            condicion += " AND [categoria] = ?"
            parametros += (categoria,)
        return self._listar(condicion, parametros, orden="id DESC")

    def obtener(self, oferta_id: int) -> OfertaPublica | None:
        return self._obtener("[id] = ?", (oferta_id,))

    def agregar(self, datos: dict) -> OfertaPublica:
        return self._agregar(datos)

    def actualizar(self, oferta_id: int, cambios: dict) -> OfertaPublica:
        return self._actualizar(oferta_id, cambios)

    def listar_por_usuario(self, usuario_id: int) -> list[OfertaPublica]:
        return self._listar("[usuario_id] = ?", (usuario_id,))
