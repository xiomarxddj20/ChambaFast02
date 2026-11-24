"""Repositorio SQL Server de productos y servicios."""
from backend.repositories.sql import SqlRepository
from backend.schemas.emprendimientos import ProductoServicioPublico

class ProductosRepository(SqlRepository):
    tabla = "productos_servicios"
    modelo = ProductoServicioPublico

    def listar_publicados(self, emprendimiento_id: int) -> list[ProductoServicioPublico]:
        return self._listar("[emprendimiento_id] = ? AND [estado] = ?", (emprendimiento_id, "publicado"))

    def obtener(self, articulo_id: int) -> ProductoServicioPublico | None:
        return self._obtener("[id] = ?", (articulo_id,))

    def agregar(self, datos: dict) -> ProductoServicioPublico:
        return self._agregar(datos)

    def actualizar(self, articulo_id: int, cambios: dict) -> ProductoServicioPublico:
        return self._actualizar(articulo_id, cambios)
