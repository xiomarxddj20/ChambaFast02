"""Pruebas aisladas de reapertura; no acceden a SQL Server."""
import unittest
from types import SimpleNamespace
from unittest.mock import Mock

from fastapi import FastAPI
from backend.apis.ofertas import crear_router_ofertas
from backend.schemas.ofertas import OfertaActualizar
from backend.services.errores import ErrorNegocio
from backend.services.ofertas import OfertasService


class ReabrirOfertasTest(unittest.TestCase):
    def setUp(self):
        self.oferta = SimpleNamespace(id=42, usuario_id=7, estado="cerrada")
        self.repositorio = Mock()
        self.repositorio.obtener.return_value = self.oferta
        self.servicio = OfertasService(self.repositorio)

    def test_propietario_reabre_cambiando_solo_el_estado(self):
        self.servicio.reabrir(42, SimpleNamespace(id=7, rol="empresa"))
        self.repositorio.actualizar.assert_called_once_with(42, {"estado": "publicada"})
        self.assertEqual(self.oferta.usuario_id, 7)

    def test_admin_puede_reabrir(self):
        self.servicio.reabrir(42, SimpleNamespace(id=1, rol="admin"))
        self.repositorio.actualizar.assert_called_once_with(42, {"estado": "publicada"})

    def test_otra_empresa_y_postulante_no_pueden_reabrir(self):
        for usuario in (SimpleNamespace(id=8, rol="empresa"), SimpleNamespace(id=7, rol="postulante")):
            with self.subTest(rol=usuario.rol):
                with self.assertRaises(ErrorNegocio) as error:
                    self.servicio.reabrir(42, usuario)
                self.assertEqual(error.exception.codigo, 403)
        self.repositorio.actualizar.assert_not_called()

    def test_oferta_inexistente_devuelve_404(self):
        self.repositorio.obtener.return_value = None
        with self.assertRaises(ErrorNegocio) as error:
            self.servicio.reabrir(42, SimpleNamespace(id=7, rol="empresa"))
        self.assertEqual(error.exception.codigo, 404)
        self.repositorio.actualizar.assert_not_called()

    def test_cerrada_no_se_edita_hasta_reabrir(self):
        propietario = SimpleNamespace(id=7, rol="empresa")
        cambios = OfertaActualizar(cargo="Nuevo puesto")
        with self.assertRaises(ErrorNegocio) as error:
            self.servicio.actualizar(42, cambios, propietario)
        self.assertEqual(error.exception.codigo, 409)
        self.servicio.reabrir(42, propietario)
        self.oferta.estado = "publicada"
        self.servicio.actualizar(42, cambios, propietario)
        self.repositorio.actualizar.assert_called_with(42, {"cargo": "Nuevo puesto"})

    def test_router_expone_patch_reabrir_autenticado(self):
        def servicio():
            return self.servicio

        def usuario():
            return SimpleNamespace(id=7, rol="empresa")

        app = FastAPI()
        app.include_router(crear_router_ofertas(servicio, usuario))
        self.assertIn("patch", app.openapi()["paths"]["/ofertas/{oferta_id}/reabrir"])


if __name__ == "__main__":
    unittest.main()
