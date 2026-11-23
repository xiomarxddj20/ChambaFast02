import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';

@Component({ selector: 'app-postular', standalone: true, imports: [FormsModule, RouterLink],
  templateUrl: './postular.html', styleUrl: './postular.css' })
export class Postular {
  private api = inject(ApiChambaFast, { optional: true });
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private detector = inject(ChangeDetectorRef);
  mensajePostulacion = ''; mensaje = ''; procesando = false;
  get ofertaId(): number { return Number(this.ruta.snapshot.paramMap.get('id')); }
  async enviar(): Promise<void> {
    if (!Number.isInteger(this.ofertaId) || this.ofertaId < 1) { this.mensaje = 'Oferta no válida.'; return; }
    if (this.mensajePostulacion.length > 1200) { this.mensaje = 'El mensaje supera 1200 caracteres.'; return; }
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    this.procesando = true;
    try { await this.api.postular(this.ofertaId, this.mensajePostulacion); await this.router.navigate(['/mis-postulaciones']); }
    catch (error) { this.mensaje = error instanceof Error ? error.message : 'No se pudo enviar la postulación.'; }
    finally {
      this.procesando = false;
      this.detector.markForCheck();
    }
  }
}
