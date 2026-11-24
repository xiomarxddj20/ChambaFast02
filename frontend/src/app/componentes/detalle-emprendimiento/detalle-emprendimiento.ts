import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Articulo, ArticuloDatos, Emprendimiento, Usuario } from '../../modelos/chambafast';

@Component({ selector: 'app-detalle-emprendimiento', standalone: true,
  imports: [FormsModule, RouterLink], templateUrl: './detalle-emprendimiento.html',
  styleUrl: './detalle-emprendimiento.css' })
export class DetalleEmprendimiento implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private route = inject(ActivatedRoute);
  negocio: Emprendimiento | null = null;
  productos: Articulo[] = [];
  usuario: Usuario | null = null;
  mensaje = ''; mostrandoFormulario = false;
  articulo: ArticuloDatos = { nombre: '', tipo: 'producto', descripcion: '', precio: '' };
  editandoArticuloId: number | null = null;
  get id(): number { return Number(this.route.snapshot.paramMap.get('id')); }
  get esPropietario(): boolean {
    return !!this.negocio && !!this.usuario &&
      (this.usuario.rol === 'admin' || (this.usuario.rol === 'empresa' && this.usuario.id === this.negocio.usuario_id));
  }
  ngOnInit(): void { void this.cargar(); }
  async cargar(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try {
      this.negocio = await this.api.detalleEmprendimiento(this.id);
      this.productos = await this.api.productosDeEmprendimiento(this.id);
      this.usuario = await this.api.usuarioActual();
    } catch { this.mensaje = 'No se pudo cargar el emprendimiento.'; }
  }
  editarArticulo(producto: Articulo): void {
    this.editandoArticuloId = producto.id;
    this.articulo = { nombre: producto.nombre, tipo: producto.tipo, descripcion: producto.descripcion, precio: producto.precio };
    this.mostrandoFormulario = true;
  }
  nuevoArticulo(): void {
    this.editandoArticuloId = null;
    this.articulo = { nombre: '', tipo: 'producto', descripcion: '', precio: '' };
    this.mostrandoFormulario = true;
  }
  async guardarArticulo(): Promise<void> {
    if (!this.api || !this.esPropietario || !this.negocio) return;
    if (this.articulo.nombre.trim().length < 2 || this.articulo.descripcion.trim().length < 5) {
      this.mensaje = 'Completa el nombre y la descripción del artículo.'; return;
    }
    try {
      if (this.editandoArticuloId) await this.api.editarProducto(this.editandoArticuloId, this.articulo);
      else await this.api.crearProducto(this.negocio.id, this.articulo);
      this.mostrandoFormulario = false; this.editandoArticuloId = null;
      this.productos = await this.api.productosDeEmprendimiento(this.negocio.id);
    } catch { this.mensaje = 'No se pudo guardar el producto o servicio.'; }
  }
  async ocultar(id: number): Promise<void> {
    if (!this.api || !this.esPropietario || !this.negocio) return;
    try { await this.api.ocultarProducto(id); this.productos = await this.api.productosDeEmprendimiento(this.negocio.id); }
    catch { this.mensaje = 'No se pudo ocultar el artículo.'; }
  }
}
