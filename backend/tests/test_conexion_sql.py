"""Pruebas de la conexión y repositorios sin escribir en la base existente."""
import unittest
from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pyodbc

from backend.core.database import cadena_conexion, conexion
from backend.repositories.ofertas import OfertasRepository
from backend.repositories.postulaciones import PostulacionesRepository
from backend.repositories.usuarios import UsuarioRepository
from backend.services.errores import ErrorNegocio


class ConexionSqlTest(unittest.TestCase):
    def setUp(self):
        self.connection = Mock()
        self.cursor = self.connection.cursor.return_value
        self.connect = patch('backend.core.database.pyodbc.connect', return_value=self.connection).start()
        self.addCleanup(patch.stopall)

    def test_cadena_configurable_por_entorno(self):
        with patch.dict('os.environ', {'SQLSERVER_CONNECTION_STRING': 'conexion_prueba'}):
            self.assertEqual(cadena_conexion(), 'conexion_prueba')

    def test_transaccion_confirma_y_cierra(self):
        with conexion() as connection:
            self.assertIs(connection, self.connection)
        self.connection.commit.assert_called_once()
        self.connection.rollback.assert_not_called()
        self.connection.close.assert_called_once()

    def test_transaccion_revierte_y_cierra_si_falla(self):
        with self.assertRaises(ValueError):
            with conexion():
                raise ValueError('prueba')
        self.connection.commit.assert_not_called()
        self.connection.rollback.assert_called_once()
        self.connection.close.assert_called_once()

    def test_error_de_conexion_se_traduce_a_503(self):
        self.connect.side_effect = pyodbc.OperationalError('08001', 'prueba')
        with self.assertRaises(ErrorNegocio) as error:
            with conexion():
                self.fail('No debe abrir la conexión')
        self.assertEqual(error.exception.codigo, 503)

    def test_consulta_de_usuario_parametrizada(self):
        self.cursor.fetchone.return_value = None
        correo = "prueba' OR 1=1 --"
        self.assertIsNone(UsuarioRepository().get_by_email(correo))
        consulta, parametros = self.cursor.execute.call_args.args
        self.assertIn('[dbo].[usuarios]', consulta)
        self.assertNotIn(correo, consulta)
        self.assertEqual(parametros, (correo,))

    def test_filtro_de_ofertas_y_orden_se_conservan(self):
        self.cursor.fetchall.return_value = []
        self.assertEqual(OfertasRepository().listar_publicadas('Tecnología'), [])
        consulta, parametros = self.cursor.execute.call_args.args
        self.assertIn('[categoria] = ?', consulta)
        self.assertIn('ORDER BY id DESC', consulta)
        self.assertEqual(parametros, ('publicada', 'Tecnología'))

    def test_fechas_datetime2_se_devuelven_como_utc(self):
        repo = PostulacionesRepository()
        datos = dict(id=2, usuario_id=1, oferta_id=3, mensaje='', estado='enviada',
                     fecha_postulacion=datetime(2026, 11, 23, 12))
        self.cursor.fetchone.return_value = tuple(datos[campo] for campo in repo.columnas)
        postulacion = repo.obtener(2)
        self.assertEqual(postulacion.fecha_postulacion.tzinfo, timezone.utc)

    def test_insert_recupera_identity_y_defaults_sin_generar_ids(self):
        repo = PostulacionesRepository()
        datos = dict(usuario_id=1, oferta_id=3, mensaje='Prueba', estado='enviada')
        registro = dict(datos, id=40, fecha_postulacion=datetime(2026, 11, 23, 12))
        self.cursor.fetchone.return_value = tuple(registro[campo] for campo in repo.columnas)
        self.assertEqual(repo.agregar(datos).id, 40)
        consulta, parametros = self.cursor.execute.call_args.args
        self.assertIn('OUTPUT', consulta)
        self.assertIn('INSERTED.[id]', consulta)
        self.assertIn('INSERTED.[fecha_postulacion]', consulta)
        self.assertEqual(parametros, tuple(datos.values()))
        self.connection.commit.assert_called_once()

    def test_duplicados_sql_conservan_respuesta_409(self):
        for repo, datos in [
            (UsuarioRepository(), {'correo': 'prueba@example.com'}),
            (PostulacionesRepository(), {'usuario_id': 1, 'oferta_id': 3}),
        ]:
            with self.subTest(tabla=repo.tabla):
                self.cursor.execute.side_effect = pyodbc.IntegrityError('23000', '(2627)')
                with self.assertRaises(ErrorNegocio) as error:
                    repo._agregar(datos)
                self.assertEqual(error.exception.codigo, 409)
        self.assertEqual(self.connection.rollback.call_count, 2)

    def test_update_parametrizado_conserva_campos(self):
        self.cursor.fetchone.return_value = None
        OfertasRepository().actualizar(42, {'estado': 'publicada'})
        consulta, parametros = self.cursor.execute.call_args.args
        self.assertIn('SET [estado] = ?', consulta)
        self.assertIn('WHERE [id] = ?', consulta)
        self.assertEqual(parametros, ('publicada', 42))

    def test_columnas_no_proceden_de_datos_externos(self):
        with self.assertRaises(ValueError):
            OfertasRepository().actualizar(42, {'campo_sql_arbitrario': 'valor'})
        self.cursor.execute.assert_not_called()


if __name__ == '__main__':
    unittest.main()
