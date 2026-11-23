"""Repositorio temporal de ofertas laborales."""
from backend.repositories import memoria as m
from backend.schemas.ofertas import OfertaPublica

class OfertasRepository:
    def listar_publicadas(self, categoria: str | None) -> list[OfertaPublica]:
        with m.candado:
            return [o.model_copy(deep=True) for o in sorted(m.ofertas.values(), key=lambda x: x.id, reverse=True)
                    if o.estado == 'publicada' and (categoria is None or o.categoria == categoria)]

    def obtener(self, oferta_id: int) -> OfertaPublica | None:
        with m.candado:
            o = m.ofertas.get(oferta_id)
            return o.model_copy(deep=True) if o else None

    def agregar(self, datos: dict) -> OfertaPublica:
        return m.agregar(m.ofertas, OfertaPublica, datos, fecha_campo='fecha_publicacion')

    def actualizar(self, oferta_id: int, cambios: dict) -> OfertaPublica:
        return m.actualizar(m.ofertas, oferta_id, cambios)

    def listar_por_usuario(self, usuario_id: int) -> list[OfertaPublica]:
        with m.candado:
            return [o.model_copy(deep=True) for o in m.ofertas.values() if o.usuario_id == usuario_id]
