from backend.services.errores import ErrorNegocio

class AdminService:
    def __init__(self, usuarios_repository):
        self.usuarios = usuarios_repository

    def listar_usuarios(self, administrador):
        self._comprobar_admin(administrador)
        return self.usuarios.listar()

    def cambiar_estado_usuario(self, usuario_id: int, activo: bool, administrador):
        self._comprobar_admin(administrador)
        if usuario_id == administrador.id and not activo:
            raise ErrorNegocio("No puedes desactivar tu propia cuenta", 400)
        usuario = self.usuarios.actualizar_estado(usuario_id, activo)
        if usuario is None:
            raise ErrorNegocio("Usuario no encontrado", 404)
        return usuario

    @staticmethod
    def _comprobar_admin(usuario):
        if usuario.rol != "admin":
            raise ErrorNegocio("Solo un administrador puede realizar esta operación", 403)
