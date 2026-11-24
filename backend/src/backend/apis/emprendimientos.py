from fastapi import APIRouter, Depends, status
from backend.apis.errores import convertir_error
from backend.schemas.auth import UsuarioPublico
from backend.schemas.emprendimientos import (
    EmprendimientoCrear, EmprendimientoActualizar, EmprendimientoPublico,
    ProductoServicioCrear, ProductoServicioActualizar, ProductoServicioPublico,
    CategoriaEmprendimiento,
)
from backend.services.errores import ErrorNegocio
from backend.services.emprendimientos import EmprendimientosService

def crear_router_emprendimientos(get_emprendimientos_service, get_current_user) -> APIRouter:
    router = APIRouter(tags=["Emprendimientos"])

    @router.get("/emprendimientos", response_model=list[EmprendimientoPublico])
    def listar(categoria: CategoriaEmprendimiento | None = None, service: EmprendimientosService = Depends(get_emprendimientos_service)):
        return service.listar(categoria)

    @router.get("/mis-emprendimientos", response_model=list[EmprendimientoPublico])
    def mios(usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.mios(usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/emprendimientos/{negocio_id}", response_model=EmprendimientoPublico)
    def detalle(negocio_id: int, service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.obtener(negocio_id)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.post("/emprendimientos", response_model=EmprendimientoPublico, status_code=status.HTTP_201_CREATED)
    def crear(datos: EmprendimientoCrear, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.crear(datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.put("/emprendimientos/{negocio_id}", response_model=EmprendimientoPublico)
    def editar(negocio_id: int, datos: EmprendimientoActualizar, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.editar(negocio_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/emprendimientos/{negocio_id}/ocultar", response_model=EmprendimientoPublico)
    def ocultar(negocio_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.ocultar(negocio_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/emprendimientos/{negocio_id}/reactivar", response_model=EmprendimientoPublico)
    def reactivar(negocio_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.reactivar(negocio_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/emprendimientos/{negocio_id}/productos", response_model=list[ProductoServicioPublico])
    def productos(negocio_id: int, service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.listar_productos(negocio_id)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.post("/emprendimientos/{negocio_id}/productos", response_model=ProductoServicioPublico, status_code=status.HTTP_201_CREATED)
    def crear_producto(negocio_id: int, datos: ProductoServicioCrear, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.crear_producto(negocio_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.put("/productos/{articulo_id}", response_model=ProductoServicioPublico)
    def editar_producto(articulo_id: int, datos: ProductoServicioActualizar, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.editar_producto(articulo_id, datos, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    @router.patch("/productos/{articulo_id}/ocultar", response_model=ProductoServicioPublico)
    def ocultar_producto(articulo_id: int, usuario: UsuarioPublico = Depends(get_current_user), service: EmprendimientosService = Depends(get_emprendimientos_service)):
        try:
            return service.ocultar_producto(articulo_id, usuario)
        except ErrorNegocio as error:
            convertir_error(error)

    return router
