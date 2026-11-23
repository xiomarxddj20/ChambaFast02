import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaLaboral } from '../../modelos/chambafast';

@Component({ selector: 'app-oferta', standalone: true, imports: [RouterLink],
  templateUrl: './oferta.html', styleUrl: './oferta.css' })
export class Oferta implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private route = inject(ActivatedRoute);
  private detector = inject(ChangeDetectorRef);
  oferta: OfertaLaboral | null = null;
  mensaje = '';

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) { this.mensaje = 'Oferta inválida.'; return; }
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.oferta = await this.api.detalleOferta(id); }
    catch { this.mensaje = 'La oferta no se encontró o ya no está publicada.'; }
    finally { this.detector.markForCheck(); }
  }
}
