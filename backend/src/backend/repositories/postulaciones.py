"""Repositorio temporal de postulaciones."""
from backend.repositories import memoria as m
from backend.schemas.postulaciones import PostulacionPublica
from backend.services.errores import ErrorNegocio

class PostulacionesRepository:
    def buscar_por_oferta_y_usuario(self, oferta_id: int, usuario_id: int) -> PostulacionPublica | None:
        with m.candado:
            return next((p.model_copy(deep=True) for p in m.postulaciones.values()
                         if p.oferta_id == oferta_id and p.usuario_id == usuario_id), None)

    def agregar(self, datos: dict) -> PostulacionPublica:
        with m.candado:
            if self.buscar_por_oferta_y_usuario(datos['oferta_id'], datos['usuario_id']):
                raise ErrorNegocio('Ya existe una postulación a esta oferta', 409)
            return m.agregar(m.postulaciones, PostulacionPublica, datos, fecha_campo='fecha_postulacion')

    def obtener(self, postulacion_id: int) -> PostulacionPublica | None:
        with m.candado:
            p = m.postulaciones.get(postulacion_id)
            return p.model_copy(deep=True) if p else None

    def listar_por_usuario(self, usuario_id: int) -> list[PostulacionPublica]:
        with m.candado:
            return [p.model_copy(deep=True) for p in m.postulaciones.values() if p.usuario_id == usuario_id]

    def listar_por_oferta(self, oferta_id: int) -> list[PostulacionPublica]:
        with m.candado:
            return [p.model_copy(deep=True) for p in m.postulaciones.values() if p.oferta_id == oferta_id]

    def cambiar_estado(self, postulacion_id: int, estado: str) -> PostulacionPublica:
        return m.actualizar(m.postulaciones, postulacion_id, {'estado': estado})
