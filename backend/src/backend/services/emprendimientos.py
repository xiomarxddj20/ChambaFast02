from backend.schemas.auth import UsuarioPublico
from backend.schemas.emprendimientos import (
    EmprendimientoCrear, EmprendimientoActualizar,
    ProductoServicioCrear, ProductoServicioActualizar,
)
from backend.services.errores import ErrorNegocio

class EmprendimientosService:
    def __init__(self, emprendimientos_repository, productos_repository):
        self.emprendimientos = emprendimientos_repository
        self.productos = productos_repository

    def listar(self, categoria: str | None = None):
        return self.emprendimientos.listar_publicados(categoria)

    def obtener(self, negocio_id: int):
        negocio = self.emprendimientos.obtener(negocio_id)
        if negocio is None or negocio.estado != "publicado":
            raise ErrorNegocio("Emprendimiento no encontrado", 404)
        return negocio

    def crear(self, datos: EmprendimientoCrear, usuario: UsuarioPublico):
        self._es_empresa(usuario)
        nuevo = datos.model_dump()
        nuevo.update(usuario_id=usuario.id, estado="publicado")
        return self.emprendimientos.agregar(nuevo)

    def editar(self, negocio_id: int, datos: EmprendimientoActualizar, usuario: UsuarioPublico):
        self._es_duenio(negocio_id, usuario)
        cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
        if not cambios:
            raise ErrorNegocio("No se enviaron cambios")
        return self.emprendimientos.actualizar(negocio_id, cambios)

    def ocultar(self, negocio_id: int, usuario: UsuarioPublico):
        self._es_duenio(negocio_id, usuario)
        return self.emprendimientos.actualizar(negocio_id, {"estado": "oculto"})

    def reactivar(self, negocio_id: int, usuario: UsuarioPublico):
        self._es_duenio(negocio_id, usuario)
        return self.emprendimientos.actualizar(negocio_id, {"estado": "publicado"})

    def mios(self, usuario: UsuarioPublico):
        self._es_empresa(usuario)
        return self.emprendimientos.listar_por_usuario(usuario.id)

    def listar_productos(self, negocio_id: int):
        self.obtener(negocio_id)
        return self.productos.listar_publicados(negocio_id)

    def crear_producto(self, negocio_id: int, datos: ProductoServicioCrear, usuario: UsuarioPublico):
        self._es_duenio(negocio_id, usuario)
        nuevo = datos.model_dump()
        nuevo.update(emprendimiento_id=negocio_id, estado="publicado")
        return self.productos.agregar(nuevo)

    def editar_producto(self, articulo_id: int, datos: ProductoServicioActualizar, usuario: UsuarioPublico):
        articulo = self.productos.obtener(articulo_id)
        if articulo is None:
            raise ErrorNegocio("Producto o servicio no encontrado", 404)
        self._es_duenio(articulo.emprendimiento_id, usuario)
        cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
        if not cambios:
            raise ErrorNegocio("No se enviaron cambios")
        return self.productos.actualizar(articulo_id, cambios)

    def ocultar_producto(self, articulo_id: int, usuario: UsuarioPublico):
        articulo = self.productos.obtener(articulo_id)
        if articulo is None:
            raise ErrorNegocio("Producto o servicio no encontrado", 404)
        self._es_duenio(articulo.emprendimiento_id, usuario)
        return self.productos.actualizar(articulo_id, {"estado": "oculto"})

    def _es_empresa(self, usuario: UsuarioPublico):
        if usuario.rol not in ("empresa", "admin"):
            raise ErrorNegocio("Solo empresas o emprendedores pueden gestionar negocios", 403)

    def _es_duenio(self, negocio_id: int, usuario: UsuarioPublico):
        negocio = self.emprendimientos.obtener(negocio_id)
        if negocio is None:
            raise ErrorNegocio("Emprendimiento no encontrado", 404)
        if usuario.rol != "admin" and (usuario.rol != "empresa" or negocio.usuario_id != usuario.id):
            raise ErrorNegocio("No puedes modificar este emprendimiento", 403)
        return negocio
