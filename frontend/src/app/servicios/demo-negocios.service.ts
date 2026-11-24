import { Injectable, inject } from '@angular/core';
import { DatosDemo } from './demo-datos.service';
import { Articulo, ArticuloDatos, Emprendimiento, EmprendimientoDatos } from '../modelos/chambafast';

@Injectable({ providedIn: 'root' })
export class DemoNegocios {
  private datos = inject(DatosDemo);

  listarEmprendimientos(categoria?: string): Emprendimiento[] {
    return this.datos.emprendimientos.filter(e => e.estado === 'publicado' && (!categoria || e.categoria === categoria)).map(e => ({...e}));
  }
  detalleEmprendimiento(id: number): Emprendimiento {
    const e = this.datos.emprendimientos.find(e => e.id === id && e.estado === 'publicado');
    if (!e) throw new Error('Emprendimiento no encontrado.');
    return {...e};
  }
  private propio(id: number): Emprendimiento {
    const u = this.datos.exigirRol('empresa', 'admin');
    const e = this.datos.emprendimientos.find(e => e.id === id);
    if (!e) throw new Error('Emprendimiento no encontrado.');
    if (u.rol !== 'admin' && e.usuario_id !== u.id) throw new Error('No puedes modificar este emprendimiento.');
    return e;
  }
  crearEmprendimiento(datos: EmprendimientoDatos): Emprendimiento {
    const u = this.datos.exigirRol('empresa', 'admin');
    const e: Emprendimiento = { ...datos, id: this.datos.siguienteId(this.datos.emprendimientos), usuario_id: u.id, estado: 'publicado', fecha_publicacion: new Date().toISOString() };
    this.datos.emprendimientos.unshift(e);
    return {...e};
  }
  actualizarEmprendimiento(id: number, datos: EmprendimientoDatos): Emprendimiento {
    const e = this.propio(id); Object.assign(e, datos); return {...e};
  }
  misEmprendimientos(): Emprendimiento[] {
    const u = this.datos.exigirRol('empresa');
    return this.datos.emprendimientos.filter(e => e.usuario_id === u.id).map(e => ({...e}));
  }
  ocultarEmprendimiento(id: number): Emprendimiento { const e = this.propio(id); e.estado = 'oculto'; return {...e}; }
  reactivarEmprendimiento(id: number): Emprendimiento { const e = this.propio(id); e.estado = 'publicado'; return {...e}; }
  productosDeEmprendimiento(id: number): Articulo[] {
    this.detalleEmprendimiento(id);
    return this.datos.articulos.filter(a => a.emprendimiento_id === id && a.estado === 'publicado').map(a => ({...a}));
  }
  crearProducto(id: number, datos: ArticuloDatos): Articulo {
    this.propio(id);
    const a: Articulo = { ...datos, id: this.datos.siguienteId(this.datos.articulos), emprendimiento_id: id, estado: 'publicado' };
    this.datos.articulos.push(a);
    return {...a};
  }
  private articuloPropio(id: number): Articulo {
    const a = this.datos.articulos.find(a => a.id === id);
    if (!a) throw new Error('Producto o servicio no encontrado.');
    this.propio(a.emprendimiento_id);
    return a;
  }
  editarProducto(id: number, datos: ArticuloDatos): Articulo {
    const a = this.articuloPropio(id); Object.assign(a, datos); return {...a};
  }
  ocultarProducto(id: number): Articulo { const a = this.articuloPropio(id); a.estado = 'oculto'; return {...a}; }
}
