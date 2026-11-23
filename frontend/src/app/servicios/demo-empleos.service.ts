import { Injectable, inject } from '@angular/core';
import { DatosDemo } from './demo-datos.service';
import { EstadoPostulacion, OfertaDatos, OfertaLaboral, Postulacion } from '../modelos/chambafast';

@Injectable({ providedIn: 'root' })
export class DemoEmpleos {
  private datos = inject(DatosDemo);

  listarOfertas(categoria?: string): OfertaLaboral[] {
    return this.datos.ofertas.filter(o => o.estado === 'publicada' && (!categoria || o.categoria === categoria)).map(o => ({...o}));
  }
  detalleOferta(id: number): OfertaLaboral {
    const oferta = this.datos.ofertas.find(o => o.id === id && o.estado === 'publicada');
    if (!oferta) throw new Error('Oferta no encontrada.');
    return {...oferta};
  }
  crearOferta(datos: OfertaDatos): OfertaLaboral {
    const u = this.datos.exigirRol('empresa', 'admin');
    const oferta: OfertaLaboral = { ...datos, id: this.datos.siguienteId(this.datos.ofertas), usuario_id: u.id, estado: 'publicada', fecha_publicacion: new Date().toISOString() };
    this.datos.ofertas.unshift(oferta);
    return {...oferta};
  }
  private propia(id: number): OfertaLaboral {
    const usuario = this.datos.exigirRol('empresa', 'admin');
    const oferta = this.datos.ofertas.find(o => o.id === id);
    if (!oferta) throw new Error('Oferta no encontrada.');
    if (usuario.rol !== 'admin' && oferta.usuario_id !== usuario.id) throw new Error('Esta oferta no te pertenece.');
    return oferta;
  }
  actualizarOferta(id: number, datos: OfertaDatos): OfertaLaboral {
    const oferta = this.propia(id);
    if (oferta.estado === 'cerrada') throw new Error('Una oferta cerrada no se puede editar.');
    Object.assign(oferta, datos);
    return {...oferta};
  }
  cerrarOferta(id: number): OfertaLaboral { const oferta = this.propia(id); oferta.estado = 'cerrada'; return {...oferta}; }
  reabrirOferta(id: number): OfertaLaboral { const oferta = this.propia(id); oferta.estado = 'publicada'; return {...oferta}; }
  misOfertas(): OfertaLaboral[] {
    const u = this.datos.exigirRol('empresa');
    return this.datos.ofertas.filter(o => o.usuario_id === u.id).map(o => ({...o}));
  }
  postular(ofertaId: number, mensaje: string): Postulacion {
    const u = this.datos.exigirRol('postulante');
    const oferta = this.detalleOferta(ofertaId);
    if (this.datos.postulaciones.some(p => p.oferta_id === oferta.id && p.usuario_id === u.id)) throw new Error('Ya postulaste a esta oferta.');
    if (mensaje.length > 1200) throw new Error('El mensaje es demasiado largo.');
    const p: Postulacion = { id: this.datos.siguienteId(this.datos.postulaciones), oferta_id: oferta.id, usuario_id: u.id, mensaje, estado: 'enviada', fecha_postulacion: new Date().toISOString() };
    this.datos.postulaciones.push(p);
    return {...p};
  }
  misPostulaciones(): Postulacion[] {
    const u = this.datos.exigirRol('postulante');
    return this.datos.postulaciones.filter(p => p.usuario_id === u.id).map(p => ({...p}));
  }
  postulacionesDeOferta(id: number): Postulacion[] {
    this.propia(id);
    return this.datos.postulaciones.filter(p => p.oferta_id === id).map(p => ({...p}));
  }
  cambiarEstadoPostulacion(id: number, estado: EstadoPostulacion): Postulacion {
    const p = this.datos.postulaciones.find(p => p.id === id);
    if (!p) throw new Error('Postulación no encontrada.');
    this.propia(p.oferta_id);
    p.estado = estado;
    return {...p};
  }
}
