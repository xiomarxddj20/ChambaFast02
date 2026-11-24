import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Articulo, ArticuloDatos, Emprendimiento, EmprendimientoDatos, EstadoPostulacion,
  OfertaDatos, OfertaLaboral, Postulacion, RegistroDatos, TokenRespuesta, Usuario,
} from '../modelos/chambafast';
import { ApiChambaFast } from './puerto-api';

export const API_URL = new InjectionToken<string>('CHAMBAFAST_API_URL', {
  providedIn: 'root', factory: () => environment.apiUrl,
});

@Injectable()
export class ApiHttpChambaFast extends ApiChambaFast {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL).replace(/\/+$/, '');
  private navegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly claveToken = 'chambafast_access_token';
  private token: string | null = this.leerToken();

  private leerToken(): string | null {
    if (!this.navegador) return null;
    try { return sessionStorage.getItem(this.claveToken); }
    catch { return null; }
  }

  private guardarToken(token: string | null): void {
    this.token = token;
    if (!this.navegador) return;
    try {
      if (token) sessionStorage.setItem(this.claveToken, token);
      else sessionStorage.removeItem(this.claveToken);
    } catch { /* La sesión sigue disponible en memoria si el navegador bloquea el almacenamiento. */ }
  }

  private peticion<T>(metodo: string, ruta: string, body?: unknown, categoria?: string): Promise<T> {
    let headers = new HttpHeaders();
    if (this.token) headers = headers.set('Authorization', `Bearer ${this.token}`);
    let params = new HttpParams();
    if (categoria) params = params.set('categoria', categoria);
    return firstValueFrom(this.http.request<T>(metodo, `${this.baseUrl}${ruta}`, {
      body, headers, params, transferCache: false,
    }));
  }

  private async solicitar<T>(metodo: string, ruta: string, body?: unknown, categoria?: string): Promise<T> {
    try { return await this.peticion<T>(metodo, ruta, body, categoria); }
    catch (error) { throw this.errorHttp(error); }
  }

  private errorHttp(error: unknown): Error {
    if (!(error instanceof HttpErrorResponse)) {
      return error instanceof Error ? error : new Error('No se pudo realizar la solicitud.');
    }
    const detalle: unknown = error.error?.detail;
    if (typeof detalle === 'string') return new Error(detalle);
    if (Array.isArray(detalle)) {
      return new Error(detalle.map(item => `${item.loc?.slice(1).join('.') ?? ''}: ${item.msg}`).join('; '));
    }
    return new Error(error.status === 0
      ? 'No se pudo conectar con el servidor.'
      : `La solicitud falló (${error.status}).`);
  }

  private async autenticar(ruta: string, datos: unknown): Promise<TokenRespuesta> {
    const respuesta = await this.solicitar<TokenRespuesta>('POST', ruta, datos);
    this.guardarToken(respuesta.access_token);
    return respuesta;
  }

  override registrar(datos: RegistroDatos): Promise<TokenRespuesta> {
    return this.autenticar('/auth/registro', datos);
  }
  override login(correo: string, contrasena: string): Promise<TokenRespuesta> {
    return this.autenticar('/auth/login', { correo, contrasena });
  }
  override async usuarioActual(): Promise<Usuario | null> {
    if (!this.token) return null;
    try { return await this.peticion<Usuario>('GET', '/auth/me'); }
    catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.guardarToken(null);
        return null;
      }
      throw this.errorHttp(error);
    }
  }
  override async cerrarSesion(): Promise<void> { this.guardarToken(null); }

  override listarOfertas(categoria?: string): Promise<OfertaLaboral[]> {
    return this.solicitar('GET', '/ofertas', undefined, categoria);
  }
  override detalleOferta(id: number): Promise<OfertaLaboral> {
    return this.solicitar('GET', `/ofertas/${id}`);
  }
  override crearOferta(datos: OfertaDatos): Promise<OfertaLaboral> {
    return this.solicitar('POST', '/ofertas', datos);
  }
  override actualizarOferta(id: number, datos: OfertaDatos): Promise<OfertaLaboral> {
    return this.solicitar('PUT', `/ofertas/${id}`, datos);
  }
  override cerrarOferta(id: number): Promise<OfertaLaboral> {
    return this.solicitar('PATCH', `/ofertas/${id}/cerrar`);
  }
  override reabrirOferta(id: number): Promise<OfertaLaboral> {
    return this.solicitar('PATCH', `/ofertas/${id}/reabrir`);
  }
  override misOfertas(): Promise<OfertaLaboral[]> {
    return this.solicitar('GET', '/mis-ofertas');
  }
  override postular(idOferta: number, mensaje: string): Promise<Postulacion> {
    return this.solicitar('POST', `/ofertas/${idOferta}/postulaciones`, { mensaje });
  }
  override misPostulaciones(): Promise<Postulacion[]> {
    return this.solicitar('GET', '/mis-postulaciones');
  }
  override postulacionesDeOferta(idOferta: number): Promise<Postulacion[]> {
    return this.solicitar('GET', `/ofertas/${idOferta}/postulaciones`);
  }
  override cambiarEstadoPostulacion(id: number, estado: EstadoPostulacion): Promise<Postulacion> {
    return this.solicitar('PATCH', `/postulaciones/${id}/estado`, { estado });
  }

  override listarEmprendimientos(categoria?: string): Promise<Emprendimiento[]> {
    return this.solicitar('GET', '/emprendimientos', undefined, categoria);
  }
  override detalleEmprendimiento(id: number): Promise<Emprendimiento> {
    return this.solicitar('GET', `/emprendimientos/${id}`);
  }
  override crearEmprendimiento(datos: EmprendimientoDatos): Promise<Emprendimiento> {
    return this.solicitar('POST', '/emprendimientos', datos);
  }
  override actualizarEmprendimiento(id: number, datos: EmprendimientoDatos): Promise<Emprendimiento> {
    return this.solicitar('PUT', `/emprendimientos/${id}`, datos);
  }
  override misEmprendimientos(): Promise<Emprendimiento[]> {
    return this.solicitar('GET', '/mis-emprendimientos');
  }
  override ocultarEmprendimiento(id: number): Promise<Emprendimiento> {
    return this.solicitar('PATCH', `/emprendimientos/${id}/ocultar`);
  }
  override reactivarEmprendimiento(id: number): Promise<Emprendimiento> {
    return this.solicitar('PATCH', `/emprendimientos/${id}/reactivar`);
  }
  override productosDeEmprendimiento(id: number): Promise<Articulo[]> {
    return this.solicitar('GET', `/emprendimientos/${id}/productos`);
  }
  override crearProducto(idNegocio: number, datos: ArticuloDatos): Promise<Articulo> {
    return this.solicitar('POST', `/emprendimientos/${idNegocio}/productos`, datos);
  }
  override editarProducto(id: number, datos: ArticuloDatos): Promise<Articulo> {
    return this.solicitar('PUT', `/productos/${id}`, datos);
  }
  override ocultarProducto(id: number): Promise<Articulo> {
    return this.solicitar('PATCH', `/productos/${id}/ocultar`);
  }

  override listarUsuarios(): Promise<Usuario[]> {
    return this.solicitar('GET', '/admin/usuarios');
  }
  override cambiarEstadoUsuario(id: number, activo: boolean): Promise<Usuario> {
    return this.solicitar('PATCH', `/admin/usuarios/${id}/estado`, { activo });
  }
}
