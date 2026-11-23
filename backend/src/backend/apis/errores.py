from fastapi import HTTPException
from backend.services.errores import ErrorNegocio

def convertir_error(error: ErrorNegocio):
    """Traduce un error de reglas del sistema a respuesta HTTP."""
    raise HTTPException(status_code=error.codigo, detail=str(error)) from error
