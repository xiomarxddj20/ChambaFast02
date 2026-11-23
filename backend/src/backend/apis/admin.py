from fastapi import APIRouter, Depends
from backend.apis.errores import convertir_error
from backend.schemas.auth import UsuarioPublico, CambiarEstadoUsuario
from backend.services.admin import AdminService
from backend.services.errores import ErrorNegocio

def crear_router_admin(get_admin_service, get_current_user) -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["Administración"])

    @router.get("/usuarios", response_model=list[UsuarioPublico])
    def listar(usuario: UsuarioPublico = Depends(get_current_user), service: AdminService = Depends(get_admin_service)):
        try:
            return [UsuarioPublico.model_validate(u) for u in service.listar_usuarios(usuario)]
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/usuarios/{usuario_id}/estado", response_model=UsuarioPublico)
    def estado(usuario_id: int, datos: CambiarEstadoUsuario, usuario: UsuarioPublico = Depends(get_current_user), service: AdminService = Depends(get_admin_service)):
        try:
            return UsuarioPublico.model_validate(service.cambiar_estado_usuario(usuario_id, datos.activo, usuario))
        except ErrorNegocio as error:
            convertir_error(error)

    return router
