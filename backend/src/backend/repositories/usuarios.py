"""Cuentas temporales en memoria; interfaz compatible con AuthService."""
from backend.repositories import memoria as m
from backend.schemas.auth import UsuarioConHash
from backend.services.errores import ErrorNegocio

class UsuarioRepository:
    def get_by_email(self, correo: str) -> UsuarioConHash | None:
        with m.candado:
            return next((u.model_copy(deep=True) for u in m.usuarios.values() if u.correo == correo), None)

    def get_by_id(self, usuario_id: int) -> UsuarioConHash | None:
        with m.candado:
            u = m.usuarios.get(usuario_id)
            return u.model_copy(deep=True) if u else None

    def add(self, datos: dict) -> UsuarioConHash:
        with m.candado:
            if any(u.correo == datos['correo'] for u in m.usuarios.values()):
                raise ErrorNegocio('Este correo ya está registrado', 409)
            return m.agregar(m.usuarios, UsuarioConHash, datos)

    def listar(self) -> list[UsuarioConHash]:
        with m.candado:
            return [u.model_copy(deep=True) for u in m.usuarios.values()]

    def actualizar_estado(self, usuario_id: int, activo: bool) -> UsuarioConHash | None:
        if self.get_by_id(usuario_id) is None: return None
        return m.actualizar(m.usuarios, usuario_id, {'activo': activo})
