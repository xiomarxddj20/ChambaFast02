"""Cuentas almacenadas en SQL Server; interfaz compatible con AuthService."""
from backend.repositories.sql import SqlRepository
from backend.schemas.auth import UsuarioConHash

class UsuarioRepository(SqlRepository):
    tabla = "usuarios"
    modelo = UsuarioConHash
    duplicado = "Este correo ya está registrado"

    def get_by_email(self, correo: str) -> UsuarioConHash | None:
        return self._obtener("[correo] = ?", (correo,))

    def get_by_id(self, usuario_id: int) -> UsuarioConHash | None:
        return self._obtener("[id] = ?", (usuario_id,))

    def add(self, datos: dict) -> UsuarioConHash:
        return self._agregar(datos)

    def listar(self) -> list[UsuarioConHash]:
        return self._listar()

    def actualizar_estado(self, usuario_id: int, activo: bool) -> UsuarioConHash | None:
        return self._actualizar(usuario_id, {'activo': activo})
