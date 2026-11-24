"""Operaciones parametrizadas compartidas por los repositorios SQL Server."""
from datetime import datetime, timezone

import pyodbc

from backend.core.database import conexion
from backend.services.errores import ErrorNegocio


class SqlRepository:
    tabla = ""
    modelo = None
    duplicado = None

    @property
    def columnas(self):
        return list(self.modelo.model_fields)

    def _columnas_sql(self, prefijo=""):
        return ", ".join(f"{prefijo}[{columna}]" for columna in self.columnas)

    def _modelo(self, fila):
        if fila is None:
            return None
        datos = dict(zip(self.columnas, fila))
        for campo, valor in datos.items():
            if isinstance(valor, datetime) and valor.tzinfo is None:
                datos[campo] = valor.replace(tzinfo=timezone.utc)
        return self.modelo.model_validate(datos)

    def _listar(self, condicion="", parametros=(), orden="id ASC"):
        consulta = f"SELECT {self._columnas_sql()} FROM [dbo].[{self.tabla}]"
        if condicion:
            consulta += f" WHERE {condicion}"
        consulta += f" ORDER BY {orden}"
        with conexion() as connection:
            cursor = connection.cursor()
            cursor.execute(consulta, parametros)
            return [self._modelo(fila) for fila in cursor.fetchall()]

    def _obtener(self, condicion, parametros):
        with conexion() as connection:
            cursor = connection.cursor()
            cursor.execute(
                f"SELECT {self._columnas_sql()} FROM [dbo].[{self.tabla}] WHERE {condicion}",
                parametros,
            )
            return self._modelo(cursor.fetchone())

    def _comprobar_columnas(self, datos):
        permitidas = set(self.columnas) - {"id", "fecha_publicacion", "fecha_postulacion"}
        if not datos or not set(datos).issubset(permitidas):
            raise ValueError("Columnas no admitidas por el repositorio")

    def _agregar(self, datos):
        self._comprobar_columnas(datos)
        columnas = ", ".join(f"[{campo}]" for campo in datos)
        marcadores = ", ".join("?" for _ in datos)
        with conexion() as connection:
            cursor = connection.cursor()
            try:
                cursor.execute(
                    f"INSERT INTO [dbo].[{self.tabla}] ({columnas}) "
                    f"OUTPUT {self._columnas_sql('INSERTED.')} VALUES ({marcadores})",
                    tuple(datos.values()),
                )
            except pyodbc.IntegrityError as error:
                if self.duplicado and any(codigo in str(error) for codigo in ("2601", "2627")):
                    raise ErrorNegocio(self.duplicado, 409) from error
                raise
            return self._modelo(cursor.fetchone())

    def _actualizar(self, registro_id, cambios):
        self._comprobar_columnas(cambios)
        asignaciones = ", ".join(f"[{campo}] = ?" for campo in cambios)
        with conexion() as connection:
            cursor = connection.cursor()
            cursor.execute(
                f"UPDATE [dbo].[{self.tabla}] SET {asignaciones} "
                f"OUTPUT {self._columnas_sql('INSERTED.')} WHERE [id] = ?",
                (*cambios.values(), registro_id),
            )
            return self._modelo(cursor.fetchone())
