from backend.schemas.auth import UsuarioPublico
from backend.schemas.ofertas import OfertaCrear, OfertaActualizar
from backend.services.errores import ErrorNegocio

class OfertasService:
    def __init__(self, repository):
        self.repository = repository

    def listar(self, categoria: str | None = None):
        return self.repository.listar_publicadas(categoria)

    def obtener(self, oferta_id: int):
        oferta = self.repository.obtener(oferta_id)
        if oferta is None or oferta.estado != "publicada":
            raise ErrorNegocio("Oferta no encontrada", 404)
        return oferta

    def publicar(self, datos: OfertaCrear, usuario: UsuarioPublico):
        if usuario.rol not in ("empresa", "admin"):
            raise ErrorNegocio("Solo empresas o emprendedores pueden publicar", 403)
        nuevo = datos.model_dump()
        nuevo.update(usuario_id=usuario.id, estado="publicada")
        return self.repository.agregar(nuevo)

    def actualizar(self, oferta_id: int, datos: OfertaActualizar, usuario: UsuarioPublico):
        oferta = self._autorizada(oferta_id, usuario)
        if oferta.estado == "cerrada":
            raise ErrorNegocio("Una oferta cerrada no puede editarse", 409)
        cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
        if not cambios:
            raise ErrorNegocio("No se enviaron cambios")
        return self.repository.actualizar(oferta_id, cambios)

    def cerrar(self, oferta_id: int, usuario: UsuarioPublico):
        self._autorizada(oferta_id, usuario)
        return self.repository.actualizar(oferta_id, {"estado": "cerrada"})

    def reabrir(self, oferta_id: int, usuario: UsuarioPublico):
        self._autorizada(oferta_id, usuario)
        return self.repository.actualizar(oferta_id, {"estado": "publicada"})

    def mias(self, usuario: UsuarioPublico):
        if usuario.rol != "empresa":
            raise ErrorNegocio("No tienes acceso a este panel", 403)
        return self.repository.listar_por_usuario(usuario.id)

    def _autorizada(self, oferta_id: int, usuario: UsuarioPublico):
        oferta = self.repository.obtener(oferta_id)
        if oferta is None:
            raise ErrorNegocio("Oferta no encontrada", 404)
        if usuario.rol != "admin" and (usuario.rol != "empresa" or oferta.usuario_id != usuario.id):
            raise ErrorNegocio("No puedes modificar esta oferta", 403)
        return oferta
