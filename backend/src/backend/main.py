from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.apis.admin import crear_router_admin
from backend.apis.auth import crear_router_auth
from backend.apis.emprendimientos import crear_router_emprendimientos
from backend.apis.ofertas import crear_router_ofertas
from backend.apis.postulaciones import crear_router_postulaciones
from backend.repositories.memoria import iniciar_demo
from backend.dependencias import (
    get_admin_service,
    get_auth_service,
    get_current_user,
    get_emprendimientos_service,
    get_ofertas_service,
    get_postulaciones_service,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    iniciar_demo()
    yield


app = FastAPI(
    title="ChambaFast API",
    description="Backend de ChambaFast",
    version="1.0.0",
    lifespan=lifespan,
)

# API de demostración independiente de Angular; solo almacena en memoria.
app.include_router(crear_router_auth(get_auth_service, get_current_user))
app.include_router(crear_router_ofertas(get_ofertas_service, get_current_user))
app.include_router(
    crear_router_postulaciones(get_postulaciones_service, get_current_user)
)
app.include_router(
    crear_router_emprendimientos(get_emprendimientos_service, get_current_user)
)
app.include_router(crear_router_admin(get_admin_service, get_current_user))


@app.get("/")
def inicio():
    return {
        "mensaje": "Bienvenido a la API de ChambaFast"
    }


@app.get("/api/salud")
def verificar_servidor():
    return {
        "estado": "ok",
        "aplicacion": "ChambaFast API"
    }
