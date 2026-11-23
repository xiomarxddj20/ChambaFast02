import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaLaboral } from '../../modelos/chambafast';

@Component({ selector: 'app-mis-ofertas', standalone: true, imports: [RouterLink],
  templateUrl: './mis-ofertas.html', styleUrl: './mis-ofertas.css' })
export class MisOfertas implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private detector = inject(ChangeDetectorRef);
  readonly cambiandoEstado = new Set<number>();
  ofertas: OfertaLaboral[] = []; mensaje = '';
  ngOnInit(): void { void this.cargar(); }
  async cargar(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.ofertas = await this.api.misOfertas(); this.mensaje = ''; }
    catch { this.mensaje = 'No se pudieron obtener tus ofertas.'; }
    finally { this.detector.markForCheck(); }
  }
  async cerrar(id: number): Promise<void> {
    if (!this.api || this.cambiandoEstado.has(id)) return;
    this.cambiandoEstado.add(id);
    try { await this.api.cerrarOferta(id); await this.cargar(); }
    catch { this.mensaje = 'No se pudo cerrar la oferta.'; }
    finally { this.cambiandoEstado.delete(id); this.detector.markForCheck(); }
  }

  async reabrir(id: number): Promise<void> {
    if (!this.api || this.cambiandoEstado.has(id)) return;
    this.cambiandoEstado.add(id);
    try { await this.api.reabrirOferta(id); await this.cargar(); }
    catch (error) { this.mensaje = error instanceof Error ? error.message : 'No se pudo reabrir la oferta.'; }
    finally { this.cambiandoEstado.delete(id); this.detector.markForCheck(); }
  }
}
