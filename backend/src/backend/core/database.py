"""Conexiones a la base SQL Server existente; no crea ni modifica el esquema."""
import os
from contextlib import contextmanager

import pyodbc

from backend.services.errores import ErrorNegocio


def cadena_conexion() -> str:
    return os.environ.get(
        "SQLSERVER_CONNECTION_STRING",
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=localhost;DATABASE=ChambaFastDB;"
        "Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;",
    )


@contextmanager
def conexion():
    try:
        connection = pyodbc.connect(cadena_conexion(), timeout=5, autocommit=False)
    except pyodbc.Error as error:
        raise ErrorNegocio("No se pudo conectar con la base de datos", 503) from error
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
