"""Repositorio temporal de productos y servicios."""
from backend.repositories import memoria as m
from backend.schemas.emprendimientos import ProductoServicioPublico

class ProductosRepository:
    def listar_publicados(self, emprendimiento_id: int) -> list[ProductoServicioPublico]:
        with m.candado:
            return [p.model_copy(deep=True) for p in m.productos.values()
                    if p.emprendimiento_id == emprendimiento_id and p.estado == 'publicado']

    def obtener(self, articulo_id: int) -> ProductoServicioPublico | None:
        with m.candado:
            p = m.productos.get(articulo_id)
            return p.model_copy(deep=True) if p else None

    def agregar(self, datos: dict) -> ProductoServicioPublico:
        return m.agregar(m.productos, ProductoServicioPublico, datos)

    def actualizar(self, articulo_id: int, cambios: dict) -> ProductoServicioPublico:
        return m.actualizar(m.productos, articulo_id, cambios)
