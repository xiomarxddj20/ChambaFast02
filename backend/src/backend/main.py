import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.apis.admin import crear_router_admin
from backend.apis.auth import crear_router_auth
from backend.apis.emprendimientos import crear_router_emprendimientos
from backend.apis.ofertas import crear_router_ofertas
from backend.apis.postulaciones import crear_router_postulaciones
from backend.dependencias import (
    get_admin_service,
    get_auth_service,
    get_current_user,
    get_emprendimientos_service,
    get_ofertas_service,
    get_postulaciones_service,
)

app = FastAPI(
    title="ChambaFast API",
    description="Backend de ChambaFast",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origen.strip()
        for origen in os.environ.get(
            "FRONTEND_ORIGINS", "http://localhost:4200,http://127.0.0.1:4200"
        ).split(",")
        if origen.strip()
    ],
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

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
