"""Almacén temporal compartido por los repositorios; no utiliza SQL ni archivos."""
from datetime import datetime, timezone
from threading import RLock
from backend.schemas.auth import UsuarioConHash
from backend.schemas.ofertas import OfertaPublica
from backend.schemas.postulaciones import PostulacionPublica
from backend.schemas.emprendimientos import EmprendimientoPublico, ProductoServicioPublico

candado = RLock()
usuarios: dict[int, UsuarioConHash] = {}
ofertas: dict[int, OfertaPublica] = {}
postulaciones: dict[int, PostulacionPublica] = {}
emprendimientos: dict[int, EmprendimientoPublico] = {}
productos: dict[int, ProductoServicioPublico] = {}

def fecha():
    return datetime.now(timezone.utc)

def siguiente_id(diccionario):
    return max(diccionario, default=0) + 1

def agregar(diccionario, modelo, datos, *, fecha_campo=None):
    with candado:
        nuevo = dict(datos, id=siguiente_id(diccionario))
        if fecha_campo:
            nuevo[fecha_campo] = fecha()
        registro = modelo.model_validate(nuevo)
        diccionario[registro.id] = registro
        return registro.model_copy(deep=True)

def actualizar(diccionario, registro_id, cambios):
    with candado:
        actual = diccionario.get(registro_id)
        if actual is None:
            raise ValueError('Registro inexistente')
        nuevo = actual.model_copy(update=cambios)
        diccionario[registro_id] = nuevo
        return nuevo.model_copy(deep=True)

# Cuentas de demostración; se reinician al reiniciar el servidor.
def iniciar_demo():
    from backend.core.security import hash_password
    if usuarios: return
    with candado:
        if usuarios: return
        for id_, nombre, correo, rol in [
            (1, 'María', 'postulante@demo.pe', 'postulante'),
            (2, 'Carlos', 'empresa@demo.pe', 'empresa'),
            (3, 'Equipo', 'admin@demo.pe', 'admin'),
        ]:
            usuarios[id_] = UsuarioConHash.model_validate({
                'id': id_, 'nombre': nombre, 'apellido': 'Demo', 'correo': correo,
                'telefono': '900000000', 'rol': rol, 'activo': True,
                'contrasena_hash': hash_password('Demo12345')
            })
        ofertas[1] = OfertaPublica.model_validate({
            'id': 1, 'usuario_id': 2, 'cargo': 'Asistente administrativo',
            'empresa': 'Empresa demostrativa', 'categoria': 'Administración',
            'descripcion': 'Apoyar la organización de documentos y la administración de una pequeña empresa.',
            'requisitos': 'Conocimientos de ofimática y buena organización.',
            'ubicacion': 'Huancayo, Junín', 'modalidad': 'Presencial', 'salario': 'A tratar',
            'estado': 'publicada', 'fecha_publicacion': fecha()
        })
        emprendimientos[1] = EmprendimientoPublico.model_validate({
            'id': 1, 'usuario_id': 2, 'nombre': 'Dulce Tentación', 'categoria': 'Alimentos',
            'descripcion': 'Tortas, postres y bocaditos artesanales para celebraciones.',
            'ubicacion': 'Huancayo, Junín', 'tipo': 'Productos', 'contacto': '999 888 777',
            'estado': 'publicado', 'fecha_publicacion': fecha()
        })
