import { Injectable, inject } from '@angular/core';
import { ApiChambaFast } from './puerto-api';
import { DemoCuentas } from './demo-cuentas.service';
import { DemoEmpleos } from './demo-empleos.service';
import { DemoNegocios } from './demo-negocios.service';
import {
  Articulo, ArticuloDatos, Emprendimiento, EmprendimientoDatos, EstadoPostulacion,
  OfertaDatos, OfertaLaboral, Postulacion, RegistroDatos, TokenRespuesta, Usuario,
} from '../modelos/chambafast';

// Adaptador local: respeta el contrato original, pero no hace solicitudes HTTP.
@Injectable()
export class ApiDemoChambaFast extends ApiChambaFast {
  private cuentas = inject(DemoCuentas);
  private empleos = inject(DemoEmpleos);
  private negocios = inject(DemoNegocios);

  async registrar(datos: RegistroDatos): Promise<TokenRespuesta> { return this.cuentas.registrar(datos); }
  async login(correo: string, contrasena: string): Promise<TokenRespuesta> { return this.cuentas.login(correo, contrasena); }
  async usuarioActual(): Promise<Usuario | null> { return this.cuentas.usuarioActual(); }
  async cerrarSesion(): Promise<void> { this.cuentas.cerrarSesion(); }
  async listarUsuarios(): Promise<Usuario[]> { return this.cuentas.listarUsuarios(); }
  async cambiarEstadoUsuario(id: number, activo: boolean): Promise<Usuario> { return this.cuentas.cambiarEstadoUsuario(id, activo); }

  async listarOfertas(categoria?: string): Promise<OfertaLaboral[]> { return this.empleos.listarOfertas(categoria); }
  async detalleOferta(id: number): Promise<OfertaLaboral> { return this.empleos.detalleOferta(id); }
  async crearOferta(datos: OfertaDatos): Promise<OfertaLaboral> { return this.empleos.crearOferta(datos); }
  async actualizarOferta(id: number, datos: OfertaDatos): Promise<OfertaLaboral> { return this.empleos.actualizarOferta(id, datos); }
  async cerrarOferta(id: number): Promise<OfertaLaboral> { return this.empleos.cerrarOferta(id); }
  async reabrirOferta(id: number): Promise<OfertaLaboral> { return this.empleos.reabrirOferta(id); }
  async misOfertas(): Promise<OfertaLaboral[]> { return this.empleos.misOfertas(); }
  async postular(id: number, mensaje: string): Promise<Postulacion> { return this.empleos.postular(id, mensaje); }
  async misPostulaciones(): Promise<Postulacion[]> { return this.empleos.misPostulaciones(); }
  async postulacionesDeOferta(id: number): Promise<Postulacion[]> { return this.empleos.postulacionesDeOferta(id); }
  async cambiarEstadoPostulacion(id: number, estado: EstadoPostulacion): Promise<Postulacion> { return this.empleos.cambiarEstadoPostulacion(id, estado); }

  async listarEmprendimientos(categoria?: string): Promise<Emprendimiento[]> { return this.negocios.listarEmprendimientos(categoria); }
  async detalleEmprendimiento(id: number): Promise<Emprendimiento> { return this.negocios.detalleEmprendimiento(id); }
  async crearEmprendimiento(datos: EmprendimientoDatos): Promise<Emprendimiento> { return this.negocios.crearEmprendimiento(datos); }
  async actualizarEmprendimiento(id: number, datos: EmprendimientoDatos): Promise<Emprendimiento> { return this.negocios.actualizarEmprendimiento(id, datos); }
  async misEmprendimientos(): Promise<Emprendimiento[]> { return this.negocios.misEmprendimientos(); }
  async ocultarEmprendimiento(id: number): Promise<Emprendimiento> { return this.negocios.ocultarEmprendimiento(id); }
  async reactivarEmprendimiento(id: number): Promise<Emprendimiento> { return this.negocios.reactivarEmprendimiento(id); }
  async productosDeEmprendimiento(id: number): Promise<Articulo[]> { return this.negocios.productosDeEmprendimiento(id); }
  async crearProducto(id: number, datos: ArticuloDatos): Promise<Articulo> { return this.negocios.crearProducto(id, datos); }
  async editarProducto(id: number, datos: ArticuloDatos): Promise<Articulo> { return this.negocios.editarProducto(id, datos); }
  async ocultarProducto(id: number): Promise<Articulo> { return this.negocios.ocultarProducto(id); }
}
