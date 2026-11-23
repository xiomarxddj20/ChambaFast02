import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaDatos } from '../../modelos/chambafast';

@Component({ selector: 'app-publicar-oferta', standalone: true,
  imports: [FormsModule, RouterLink], templateUrl: './publicar-oferta.html', styleUrl: './publicar-oferta.css' })
export class PublicarOferta implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private detector = inject(ChangeDetectorRef);
  editandoId: number | null = null;
  procesando = false; mensaje = '';
  oferta: OfertaDatos = {
    cargo: '', empresa: '', categoria: 'Administración', descripcion: '',
    requisitos: '', ubicacion: '', modalidad: 'Presencial', salario: '',
  };

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.editandoId = id;
    if (!this.api) return;
    try {
      const actual = await this.api.detalleOferta(id);
      this.oferta = {
        cargo: actual.cargo, empresa: actual.empresa, categoria: actual.categoria,
        descripcion: actual.descripcion, requisitos: actual.requisitos,
        ubicacion: actual.ubicacion, modalidad: actual.modalidad, salario: actual.salario,
      };
    } catch { this.mensaje = 'No se pudo cargar la oferta para editar.'; }
    finally { this.detector.markForCheck(); }
  }

  async publicar(): Promise<void> {
    if (this.procesando) return;
    if (!this.oferta.cargo.trim() || !this.oferta.empresa.trim() || !this.oferta.ubicacion.trim() ||
        this.oferta.descripcion.trim().length < 15 || this.oferta.requisitos.trim().length < 10) {
      this.mensaje = 'Completa los datos y descripciones obligatorias.'; return;
    }
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    this.procesando = true;
    try {
      if (this.editandoId) await this.api.actualizarOferta(this.editandoId, this.oferta);
      else await this.api.crearOferta(this.oferta);
      await this.router.navigate(['/mis-ofertas']);
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo guardar la oferta.';
    } finally {
      this.procesando = false;
      this.detector.markForCheck();
    }
  }
}
