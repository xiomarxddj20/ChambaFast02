import { Injectable } from '@angular/core';
import { Articulo, Emprendimiento, OfertaLaboral, Postulacion, Usuario } from '../modelos/chambafast';

interface CuentaDemo extends Usuario { clave: string; }

@Injectable({ providedIn: 'root' })
export class DatosDemo {
  readonly cuentas: CuentaDemo[] = [
    { id: 1, nombre: 'María', apellido: 'Quispe', correo: 'postulante@demo.pe', telefono: '900000001', rol: 'postulante', activo: true, clave: 'Demo12345' },
    { id: 2, nombre: 'Carlos', apellido: 'Rojas', correo: 'empresa@demo.pe', telefono: '900000002', rol: 'empresa', activo: true, clave: 'Demo12345' },
    { id: 3, nombre: 'Equipo', apellido: 'Administrador', correo: 'admin@demo.pe', telefono: '900000003', rol: 'admin', activo: true, clave: 'Demo12345' },
  ];
  sesion: number | null = null;
  readonly ofertas: OfertaLaboral[] = [
    { id: 1, usuario_id: 2, cargo: 'Asistente administrativo', empresa: 'Empresa demostrativa', categoria: 'Administración', descripcion: 'Apoyar en la organización de documentos y en las tareas administrativas de una pequeña empresa.', requisitos: 'Manejo de ofimática y buena organización.', ubicacion: 'Huancayo, Junín', modalidad: 'Presencial', salario: 'A tratar', estado: 'publicada', fecha_publicacion: new Date().toISOString() },
    { id: 2, usuario_id: 2, cargo: 'Desarrollador web junior', empresa: 'Empresa demostrativa', categoria: 'Tecnología', descripcion: 'Colaborar en el desarrollo y mantenimiento de páginas web y aplicativos internos.', requisitos: 'Conocimientos básicos de HTML, CSS, TypeScript y trabajo en equipo.', ubicacion: 'Lima, Perú', modalidad: 'Remoto', salario: 'A tratar', estado: 'publicada', fecha_publicacion: new Date().toISOString() },
  ];
  readonly postulaciones: Postulacion[] = [];
  readonly emprendimientos: Emprendimiento[] = [
    { id: 1, usuario_id: 2, nombre: 'Dulce Tentación', categoria: 'Alimentos', descripcion: 'Tortas, postres y bocaditos para celebraciones y reuniones.', ubicacion: 'Huancayo, Junín', tipo: 'Productos', contacto: '999 888 777', estado: 'publicado', fecha_publicacion: new Date().toISOString() },
    { id: 2, usuario_id: 2, nombre: 'Soluciones Digitales', categoria: 'Tecnología', descripcion: 'Diseño de páginas web y mantenimiento básico de computadoras.', ubicacion: 'El Tambo, Junín', tipo: 'Servicios', contacto: '999 888 666', estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  ];
  readonly articulos: Articulo[] = [
    { id: 1, emprendimiento_id: 1, nombre: 'Torta personalizada', tipo: 'producto', descripcion: 'Torta artesanal decorada para celebraciones.', precio: 'S/ 80', estado: 'publicado' },
    { id: 2, emprendimiento_id: 2, nombre: 'Página web informativa', tipo: 'servicio', descripcion: 'Diseño de sitio web para pequeñas empresas.', precio: 'A tratar', estado: 'publicado' },
  ];

  usuario(): Usuario | null {
    const cuenta = this.cuentas.find(u => u.id === this.sesion && u.activo);
    if (!cuenta) { this.sesion = null; return null; }
    const { clave: _clave, ...publico } = cuenta;
    return { ...publico };
  }

  exigirUsuario(): Usuario {
    const u = this.usuario();
    if (!u) throw new Error('Debes iniciar sesión (modo demo).');
    return u;
  }

  exigirRol(...roles: Usuario['rol'][]): Usuario {
    const u = this.exigirUsuario();
    if (!roles.includes(u.rol)) throw new Error('No tienes permisos para realizar esta acción.');
    return u;
  }

  siguienteId(elementos: {id: number}[]): number {
    return Math.max(0, ...elementos.map(elemento => elemento.id)) + 1;
  }
}
