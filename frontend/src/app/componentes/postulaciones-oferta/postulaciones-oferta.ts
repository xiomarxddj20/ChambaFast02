import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { ETIQUETAS_ESTADO_POSTULACION, EstadoPostulacion, Postulacion } from '../../modelos/chambafast';

@Component({ selector: 'app-postulaciones-oferta', standalone: true, imports: [RouterLink],
  templateUrl: './postulaciones-oferta.html', styleUrl: './postulaciones-oferta.css' })
export class PostulacionesOferta implements OnInit {
  readonly estadosPostulacion = ETIQUETAS_ESTADO_POSTULACION;
  private api = inject(ApiChambaFast, { optional: true });
  private ruta = inject(ActivatedRoute);
  private detector = inject(ChangeDetectorRef);
  postulaciones: Postulacion[] = []; mensaje = '';
  get ofertaId(): number { return Number(this.ruta.snapshot.paramMap.get('id')); }
  ngOnInit(): void { void this.cargar(); }
  async cargar(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.postulaciones = await this.api.postulacionesDeOferta(this.ofertaId); this.mensaje = ''; }
    catch { this.mensaje = 'No se pudieron cargar las postulaciones.'; }
    finally { this.detector.markForCheck(); }
  }
  async cambiar(id: number, estado: EstadoPostulacion): Promise<void> {
    if (!this.api) return;
    try { await this.api.cambiarEstadoPostulacion(id, estado); await this.cargar(); }
    catch { this.mensaje = 'No se pudo modificar el estado.'; }
    finally { this.detector.markForCheck(); }
  }
}
