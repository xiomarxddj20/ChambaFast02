"""Repositorio temporal de negocios."""
from backend.repositories import memoria as m
from backend.schemas.emprendimientos import EmprendimientoPublico

class EmprendimientosRepository:
    def listar_publicados(self, categoria: str | None) -> list[EmprendimientoPublico]:
        with m.candado:
            return [e.model_copy(deep=True) for e in m.emprendimientos.values()
                    if e.estado == 'publicado' and (not categoria or e.categoria == categoria)]

    def obtener(self, negocio_id: int) -> EmprendimientoPublico | None:
        with m.candado:
            e = m.emprendimientos.get(negocio_id)
            return e.model_copy(deep=True) if e else None

    def agregar(self, datos: dict) -> EmprendimientoPublico:
        return m.agregar(m.emprendimientos, EmprendimientoPublico, datos, fecha_campo='fecha_publicacion')

    def actualizar(self, negocio_id: int, cambios: dict) -> EmprendimientoPublico:
        return m.actualizar(m.emprendimientos, negocio_id, cambios)

    def listar_por_usuario(self, usuario_id: int) -> list[EmprendimientoPublico]:
        with m.candado:
            return [e.model_copy(deep=True) for e in m.emprendimientos.values() if e.usuario_id == usuario_id]
