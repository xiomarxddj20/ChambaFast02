"""Repositorio SQL Server de negocios."""
from backend.repositories.sql import SqlRepository
from backend.schemas.emprendimientos import EmprendimientoPublico

class EmprendimientosRepository(SqlRepository):
    tabla = "emprendimientos"
    modelo = EmprendimientoPublico

    def listar_publicados(self, categoria: str | None) -> list[EmprendimientoPublico]:
        condicion = "[estado] = ?"
        parametros = ("publicado",)
        if categoria:
            condicion += " AND [categoria] = ?"
            parametros += (categoria,)
        return self._listar(condicion, parametros)

    def obtener(self, negocio_id: int) -> EmprendimientoPublico | None:
        return self._obtener("[id] = ?", (negocio_id,))

    def agregar(self, datos: dict) -> EmprendimientoPublico:
        return self._agregar(datos)

    def actualizar(self, negocio_id: int, cambios: dict) -> EmprendimientoPublico:
        return self._actualizar(negocio_id, cambios)

    def listar_por_usuario(self, usuario_id: int) -> list[EmprendimientoPublico]:
        return self._listar("[usuario_id] = ?", (usuario_id,))
