"""Dependencias de FastAPI: repositorios, servicios y usuario autenticado."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

from backend.core.security import decode_access_token
from backend.repositories.emprendimientos import EmprendimientosRepository
from backend.repositories.ofertas import OfertasRepository
from backend.repositories.postulaciones import PostulacionesRepository
from backend.repositories.productos import ProductosRepository
from backend.repositories.usuarios import UsuarioRepository
from backend.schemas.auth import UsuarioPublico
from backend.services.admin import AdminService
from backend.services.auth import AuthService
from backend.services.emprendimientos import EmprendimientosService
from backend.services.ofertas import OfertasService
from backend.services.postulaciones import PostulacionesService

seguridad = HTTPBearer(auto_error=False)


def get_usuarios_repository() -> UsuarioRepository:
    return UsuarioRepository()


def get_ofertas_repository() -> OfertasRepository:
    return OfertasRepository()


def get_postulaciones_repository() -> PostulacionesRepository:
    return PostulacionesRepository()


def get_emprendimientos_repository() -> EmprendimientosRepository:
    return EmprendimientosRepository()


def get_productos_repository() -> ProductosRepository:
    return ProductosRepository()


def get_auth_service(
    repositorio: UsuarioRepository = Depends(get_usuarios_repository),
) -> AuthService:
    return AuthService(repositorio)


def get_ofertas_service(
    repositorio: OfertasRepository = Depends(get_ofertas_repository),
) -> OfertasService:
    return OfertasService(repositorio)


def get_postulaciones_service(
    postulaciones: PostulacionesRepository = Depends(
        get_postulaciones_repository
    ),
    ofertas: OfertasRepository = Depends(get_ofertas_repository),
) -> PostulacionesService:
    return PostulacionesService(postulaciones, ofertas)


def get_emprendimientos_service(
    emprendimientos: EmprendimientosRepository = Depends(
        get_emprendimientos_repository
    ),
    productos: ProductosRepository = Depends(get_productos_repository),
) -> EmprendimientosService:
    return EmprendimientosService(emprendimientos, productos)


def get_admin_service(
    usuarios: UsuarioRepository = Depends(get_usuarios_repository),
) -> AdminService:
    return AdminService(usuarios)


def get_current_user(
    credenciales: HTTPAuthorizationCredentials | None = Depends(seguridad),
    repositorio: UsuarioRepository = Depends(get_usuarios_repository),
) -> UsuarioPublico:
    """Valida el JWT y devuelve el usuario actual desde el repositorio temporal."""
    if credenciales is None or credenciales.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        datos = decode_access_token(credenciales.credentials)
        usuario_id = int(datos["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    usuario = repositorio.get_by_id(usuario_id)
    if usuario is None or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La cuenta no existe o está desactivada",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UsuarioPublico.model_validate(usuario)
