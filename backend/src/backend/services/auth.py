
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError

from backend.schemas.auth import RegistroRequest, LoginRequest


class AuthService:

    def __init__(self, repository):
        self.repository = repository
        self.hasher = PasswordHasher()

    # Registrar un nuevo usuario
    def registrar(self, datos: RegistroRequest):

        correo = datos.correo.strip().lower()

        # Comprobar que el correo no esté registrado
        usuario_existente = self.repository.get_by_email(correo)

        if usuario_existente is not None:
            raise ValueError("El correo ya está registrado")

        # Preparar los datos del usuario
        nuevo_usuario = {
            "nombre": datos.nombre.strip(),
            "apellido": datos.apellido.strip(),
            "correo": correo,
            "telefono": datos.telefono.strip(),
            "rol": datos.rol,
            "contrasena_hash": self.hasher.hash(datos.contrasena)
        }

        # Solicitar el registro al repositorio
        return self.repository.add(nuevo_usuario)

    # Verificar una contraseña
    def verificar_contrasena(
        self,
        contrasena: str,
        contrasena_hash: str
    ) -> bool:

        try:
            return self.hasher.verify(
                contrasena_hash,
                contrasena
            )

        except (VerificationError, InvalidHashError):
            return False

    # Iniciar sesión
    def autenticar(self, datos: LoginRequest):

        correo = datos.correo.strip().lower()

        # Buscar al usuario
        usuario = self.repository.get_by_email(correo)

        if usuario is None:
            raise ValueError("Correo o contraseña incorrectos")

        # Comprobar la contraseña
        if not self.verificar_contrasena(
            datos.contrasena,
            usuario.contrasena_hash
        ):
            raise ValueError("Correo o contraseña incorrectos")

        return usuario
