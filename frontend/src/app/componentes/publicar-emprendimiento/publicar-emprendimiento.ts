import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { EmprendimientoDatos } from '../../modelos/chambafast';

@Component({ selector: 'app-publicar-emprendimiento', standalone: true,
  imports: [FormsModule, RouterLink], templateUrl: './publicar-emprendimiento.html',
  styleUrl: './publicar-emprendimiento.css' })
export class PublicarEmprendimiento implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  editandoId: number | null = null;
  mensaje = ''; procesando = false;
  negocio: EmprendimientoDatos = {
    nombre: '', categoria: 'Alimentos', descripcion: '', ubicacion: '',
    tipo: 'Productos', contacto: '',
  };
  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.editandoId = id;
    if (!this.api) return;
    try {
      const actual = await this.api.detalleEmprendimiento(id);
      this.negocio = { nombre: actual.nombre, categoria: actual.categoria,
        descripcion: actual.descripcion, ubicacion: actual.ubicacion,
        tipo: actual.tipo, contacto: actual.contacto };
    } catch { this.mensaje = 'No se pudo cargar el emprendimiento.'; }
  }
  async guardar(): Promise<void> {
    if (!this.negocio.nombre.trim() || !this.negocio.contacto.trim() ||
        !this.negocio.ubicacion.trim() || this.negocio.descripcion.trim().length < 15) {
      this.mensaje = 'Completa los campos obligatorios.'; return;
    }
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    this.procesando = true;
    try {
      if (this.editandoId) await this.api.actualizarEmprendimiento(this.editandoId, this.negocio);
      else await this.api.crearEmprendimiento(this.negocio);
      await this.router.navigate(['/mis-emprendimientos']);
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo guardar el emprendimiento.';
    } finally { this.procesando = false; }
  }
}
