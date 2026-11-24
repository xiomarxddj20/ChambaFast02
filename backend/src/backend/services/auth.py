from backend.core.security import create_access_token, hash_password, verify_password
from backend.schemas.auth import LoginRequest, RegistroRequest, UsuarioConHash
from backend.services.errores import ErrorNegocio

class AuthService:
    """Reglas de registro y login, sin consultas SQL."""
    def __init__(self, repository):
        self.repository = repository

    def registrar(self, datos: RegistroRequest) -> tuple[UsuarioConHash, str, int]:
        correo = str(datos.correo).strip().lower()
        if self.repository.get_by_email(correo) is not None:
            raise ErrorNegocio("Este correo ya está registrado", 409)
        nuevo = {
            "nombre": datos.nombre.strip(), "apellido": datos.apellido.strip(),
            "correo": correo, "telefono": datos.telefono.strip(), "rol": datos.rol,
            "contrasena_hash": hash_password(datos.contrasena), "activo": True,
        }
        # El repositorio debe garantizar UNIQUE(correo) también en SQL Server.
        # Si dos registros coinciden, el repositorio debe traducir el duplicado
        # a ErrorNegocio(..., 409).
        usuario = self.repository.add(nuevo)
        token, segundos = create_access_token(usuario.id)
        return usuario, token, segundos

    def autenticar(self, datos: LoginRequest) -> tuple[UsuarioConHash, str, int]:
        usuario = self.repository.get_by_email(str(datos.correo).strip().lower())
        if usuario is None or not verify_password(datos.contrasena, usuario.contrasena_hash):
            raise ErrorNegocio("Correo o contraseña incorrectos", 401)
        if not usuario.activo:
            raise ErrorNegocio("La cuenta está desactivada", 403)
        token, segundos = create_access_token(usuario.id)
        return usuario, token, segundos
