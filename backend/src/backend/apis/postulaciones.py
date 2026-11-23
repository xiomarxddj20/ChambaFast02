from fastapi import APIRouter, Depends, status
from backend.apis.errores import convertir_error
from backend.schemas.auth import UsuarioPublico
from backend.schemas.postulaciones import PostulacionCrear, PostulacionEstado, PostulacionPublica
from backend.services.errores import ErrorNegocio
from backend.services.postulaciones import PostulacionesService

def crear_router_postulaciones(get_postulaciones_service, get_current_user) -> APIRouter:
    router = APIRouter(tags=["Postulaciones"])

    @router.post("/ofertas/{oferta_id}/postulaciones", response_model=PostulacionPublica, status_code=status.HTTP_201_CREATED)
    def postular(oferta_id: int, datos: PostulacionCrear, usuario: UsuarioPublico = Depends(get_current_user), service: PostulacionesService = Depends(get_postulaciones_service)):
        try:
            return service.postular(oferta_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/mis-postulaciones", response_model=list[PostulacionPublica])
    def mias(usuario: UsuarioPublico = Depends(get_current_user), service: PostulacionesService = Depends(get_postulaciones_service)):
        try:
            return service.mias(usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/ofertas/{oferta_id}/postulaciones", response_model=list[PostulacionPublica])
    def por_oferta(oferta_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: PostulacionesService = Depends(get_postulaciones_service)):
        try:
            return service.por_oferta(oferta_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/postulaciones/{postulacion_id}/estado", response_model=PostulacionPublica)
    def cambiar_estado(postulacion_id: int, datos: PostulacionEstado, usuario: UsuarioPublico = Depends(get_current_user), service: PostulacionesService = Depends(get_postulaciones_service)):
        try:
            return service.cambiar_estado(postulacion_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    return router
