from fastapi import APIRouter, Depends, status
from backend.apis.errores import convertir_error
from backend.schemas.auth import UsuarioPublico
from backend.schemas.ofertas import OfertaCrear, OfertaActualizar, OfertaPublica, CategoriaOferta
from backend.services.errores import ErrorNegocio
from backend.services.ofertas import OfertasService

def crear_router_ofertas(get_ofertas_service, get_current_user) -> APIRouter:
    router = APIRouter(tags=["Ofertas laborales"])

    @router.get("/ofertas", response_model=list[OfertaPublica])
    def listar(categoria: CategoriaOferta | None = None, service: OfertasService = Depends(get_ofertas_service)):
        return service.listar(categoria)

    @router.get("/mis-ofertas", response_model=list[OfertaPublica])
    def mis_ofertas(usuario: UsuarioPublico = Depends(get_current_user), service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.mias(usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/ofertas/{oferta_id}", response_model=OfertaPublica)
    def detalle(oferta_id: int, service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.obtener(oferta_id)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.post("/ofertas", response_model=OfertaPublica, status_code=status.HTTP_201_CREATED)
    def publicar(datos: OfertaCrear, usuario: UsuarioPublico = Depends(get_current_user), service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.publicar(datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.put("/ofertas/{oferta_id}", response_model=OfertaPublica)
    def editar(oferta_id: int, datos: OfertaActualizar, usuario: UsuarioPublico = Depends(get_current_user), service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.actualizar(oferta_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/ofertas/{oferta_id}/cerrar", response_model=OfertaPublica)
    def cerrar(oferta_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.cerrar(oferta_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/ofertas/{oferta_id}/reabrir", response_model=OfertaPublica)
    def reabrir(oferta_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: OfertasService = Depends(get_ofertas_service)):
        try:
            return service.reabrir(oferta_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    return router
