import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { ETIQUETAS_ESTADO_POSTULACION, Postulacion } from '../../modelos/chambafast';

@Component({ selector: 'app-mis-postulaciones', standalone: true, imports: [RouterLink, DatePipe],
  templateUrl: './mis-postulaciones.html', styleUrl: './mis-postulaciones.css' })
export class MisPostulaciones implements OnInit {
  readonly estadosPostulacion = ETIQUETAS_ESTADO_POSTULACION;
  private api = inject(ApiChambaFast, { optional: true });
  private detector = inject(ChangeDetectorRef);
  postulaciones: Postulacion[] = [];
  mensaje = '';
  async ngOnInit(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.postulaciones = await this.api.misPostulaciones(); }
    catch { this.mensaje = 'No se pudo consultar tu historial.'; }
    finally { this.detector.markForCheck(); }
  }
}
