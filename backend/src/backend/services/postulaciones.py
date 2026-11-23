from backend.schemas.auth import UsuarioPublico
from backend.schemas.postulaciones import PostulacionCrear, PostulacionEstado
from backend.services.errores import ErrorNegocio

class PostulacionesService:
    def __init__(self, postulaciones_repository, ofertas_repository):
        self.postulaciones = postulaciones_repository
        self.ofertas = ofertas_repository

    def postular(self, oferta_id: int, datos: PostulacionCrear, usuario: UsuarioPublico):
        if usuario.rol != "postulante":
            raise ErrorNegocio("Solo postulantes pueden postular", 403)
        oferta = self.ofertas.obtener(oferta_id)
        if oferta is None or oferta.estado != "publicada":
            raise ErrorNegocio("Oferta no disponible", 404)
        if self.postulaciones.buscar_por_oferta_y_usuario(oferta_id, usuario.id):
            raise ErrorNegocio("Ya postulaste a esta oferta", 409)
        # SQL debe imponer UNIQUE(oferta_id, usuario_id) para impedir carreras.
        return self.postulaciones.agregar({
            "oferta_id": oferta_id, "usuario_id": usuario.id,
            "mensaje": datos.mensaje.strip(), "estado": "enviada",
        })

    def mias(self, usuario: UsuarioPublico):
        if usuario.rol != "postulante":
            raise ErrorNegocio("Solo los postulantes tienen este historial", 403)
        return self.postulaciones.listar_por_usuario(usuario.id)

    def por_oferta(self, oferta_id: int, usuario: UsuarioPublico):
        oferta = self.ofertas.obtener(oferta_id)
        if oferta is None:
            raise ErrorNegocio("Oferta no encontrada", 404)
        if usuario.rol != "admin" and (usuario.rol != "empresa" or oferta.usuario_id != usuario.id):
            raise ErrorNegocio("No puedes ver estas postulaciones", 403)
        return self.postulaciones.listar_por_oferta(oferta_id)

    def cambiar_estado(self, postulacion_id: int, datos: PostulacionEstado, usuario: UsuarioPublico):
        postulacion = self.postulaciones.obtener(postulacion_id)
        if postulacion is None:
            raise ErrorNegocio("Postulación no encontrada", 404)
        self.por_oferta(postulacion.oferta_id, usuario)
        if postulacion.estado in ("aceptada", "rechazada"):
            raise ErrorNegocio("Esta postulación ya tiene una decisión final", 409)
        if datos.estado == "enviada":
            raise ErrorNegocio("No se puede volver al estado enviada")
        return self.postulaciones.cambiar_estado(postulacion_id, datos.estado)
