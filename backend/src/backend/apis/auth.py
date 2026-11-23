"""Rutas de autenticación. La conexión inyecta las dependencias al registrar el router."""
from fastapi import APIRouter, Depends, status
from backend.apis.errores import convertir_error
from backend.schemas.auth import LoginRequest, RegistroRequest, TokenResponse, UsuarioPublico
from backend.services.auth import AuthService
from backend.services.errores import ErrorNegocio

def crear_router_auth(get_auth_service, get_current_user) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["Autenticación"])

    def respuesta(resultado):
        usuario, token, segundos = resultado
        return TokenResponse(
            access_token=token, expires_in=segundos,
            usuario=UsuarioPublico.model_validate(usuario),
        )

    @router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
    def registro(datos: RegistroRequest, service: AuthService = Depends(get_auth_service)):
        try:
            return respuesta(service.registrar(datos))
        except ErrorNegocio as error:
            convertir_error(error)

    @router.post("/login", response_model=TokenResponse)
    def login(datos: LoginRequest, service: AuthService = Depends(get_auth_service)):
        try:
            return respuesta(service.autenticar(datos))
        except ErrorNegocio as error:
            convertir_error(error)

    @router.get("/me", response_model=UsuarioPublico)
    def me(usuario: UsuarioPublico = Depends(get_current_user)):
        return usuario

    return router
