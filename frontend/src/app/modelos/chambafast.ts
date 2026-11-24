// Tipos de datos compartidos con los esquemas de FastAPI.
export type Rol = 'postulante' | 'empresa' | 'admin';
export type CategoriaOferta = 'Administración' | 'Tecnología' | 'Ventas' | 'Atención al cliente' | 'Marketing' | 'Diseño';
export type Modalidad = 'Presencial' | 'Remoto' | 'Híbrido';
export type CategoriaNegocio = 'Alimentos' | 'Ropa y accesorios' | 'Tecnología' | 'Belleza' | 'Servicios' | 'Artesanía';
export type EstadoPostulacion = 'enviada' | 'en_revision' | 'aceptada' | 'rechazada';

export const ETIQUETAS_ESTADO_POSTULACION: Record<EstadoPostulacion, string> = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

export interface Usuario {
  id: number; nombre: string; apellido: string; correo: string;
  telefono: string; rol: Rol; activo: boolean;
}
export interface RegistroDatos {
  nombre: string; apellido: string; correo: string; telefono: string;
  rol: 'postulante' | 'empresa'; contrasena: string;
}
export interface TokenRespuesta {
  access_token: string; token_type: 'bearer'; expires_in: number; usuario: Usuario;
}
export interface OfertaDatos {
  cargo: string; empresa: string; categoria: CategoriaOferta;
  descripcion: string; requisitos: string; ubicacion: string;
  modalidad: Modalidad; salario: string;
}
export interface OfertaLaboral extends OfertaDatos {
  id: number; usuario_id: number; estado: 'publicada' | 'cerrada'; fecha_publicacion: string;
}
export interface Postulacion {
  id: number; oferta_id: number; usuario_id: number; mensaje: string;
  estado: EstadoPostulacion; fecha_postulacion: string;
}
export interface EmprendimientoDatos {
  nombre: string; categoria: CategoriaNegocio; descripcion: string;
  ubicacion: string; tipo: 'Productos' | 'Servicios' | 'Ambos'; contacto: string;
}
export interface Emprendimiento extends EmprendimientoDatos {
  id: number; usuario_id: number; estado: 'publicado' | 'oculto'; fecha_publicacion: string;
}
export interface ArticuloDatos {
  nombre: string; tipo: 'producto' | 'servicio'; descripcion: string; precio: string;
}
export interface Articulo extends ArticuloDatos {
  id: number; emprendimiento_id: number; estado: 'publicado' | 'oculto';
}
