from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ChambaFast API",
    description="Backend de ChambaFast",
    version="1.0.0"
)

# Permitir la comunicación con Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

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
