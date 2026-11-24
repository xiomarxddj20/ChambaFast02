import { Injectable } from '@angular/core';
import {
  Usuario, RegistroDatos, TokenRespuesta, OfertaDatos, OfertaLaboral,
  Postulacion, EmprendimientoDatos, Emprendimiento, ArticuloDatos, Articulo,
  EstadoPostulacion,
} from '../modelos/chambafast';

/**
 * Contrato de comunicación: NO contiene HttpClient, URL, tokens ni SQL.
 * La otra IA implementará esta clase y la registrará como proveedor Angular.
 */
@Injectable()
export abstract class ApiChambaFast {
  abstract registrar(datos: RegistroDatos): Promise<TokenRespuesta>;
  abstract login(correo: string, contrasena: string): Promise<TokenRespuesta>;
  abstract usuarioActual(): Promise<Usuario | null>;
  abstract cerrarSesion(): Promise<void>;

  abstract listarOfertas(categoria?: string): Promise<OfertaLaboral[]>;
  abstract detalleOferta(id: number): Promise<OfertaLaboral>;
  abstract crearOferta(datos: OfertaDatos): Promise<OfertaLaboral>;
  abstract actualizarOferta(id: number, datos: OfertaDatos): Promise<OfertaLaboral>;
  abstract cerrarOferta(id: number): Promise<OfertaLaboral>;
  abstract reabrirOferta(id: number): Promise<OfertaLaboral>;
  abstract misOfertas(): Promise<OfertaLaboral[]>;

  abstract postular(idOferta: number, mensaje: string): Promise<Postulacion>;
  abstract misPostulaciones(): Promise<Postulacion[]>;
  abstract postulacionesDeOferta(idOferta: number): Promise<Postulacion[]>;
  abstract cambiarEstadoPostulacion(id: number, estado: EstadoPostulacion): Promise<Postulacion>;

  abstract listarEmprendimientos(categoria?: string): Promise<Emprendimiento[]>;
  abstract detalleEmprendimiento(id: number): Promise<Emprendimiento>;
  abstract crearEmprendimiento(datos: EmprendimientoDatos): Promise<Emprendimiento>;
  abstract actualizarEmprendimiento(id: number, datos: EmprendimientoDatos): Promise<Emprendimiento>;
  abstract misEmprendimientos(): Promise<Emprendimiento[]>;
  abstract ocultarEmprendimiento(id: number): Promise<Emprendimiento>;
  abstract reactivarEmprendimiento(id: number): Promise<Emprendimiento>;
  abstract productosDeEmprendimiento(id: number): Promise<Articulo[]>;
  abstract crearProducto(idNegocio: number, datos: ArticuloDatos): Promise<Articulo>;
  abstract editarProducto(id: number, datos: ArticuloDatos): Promise<Articulo>;
  abstract ocultarProducto(id: number): Promise<Articulo>;

  abstract listarUsuarios(): Promise<Usuario[]>;
  abstract cambiarEstadoUsuario(id: number, activo: boolean): Promise<Usuario>;
}
