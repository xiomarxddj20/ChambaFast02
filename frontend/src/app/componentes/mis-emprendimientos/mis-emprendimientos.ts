import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Emprendimiento } from '../../modelos/chambafast';

@Component({ selector: 'app-mis-emprendimientos', standalone: true, imports: [RouterLink],
  templateUrl: './mis-emprendimientos.html', styleUrl: './mis-emprendimientos.css' })
export class MisEmprendimientos implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  negocios: Emprendimiento[] = []; mensaje = '';
  async actualizarEstado(negocio: Emprendimiento): Promise<void> {
    if (!this.api) return;
    try {
      if (negocio.estado === "publicado") await this.api.ocultarEmprendimiento(negocio.id);
      else await this.api.reactivarEmprendimiento(negocio.id);
      this.negocios = await this.api.misEmprendimientos();
    } catch { this.mensaje = "No se pudo cambiar el estado del negocio."; }
  }
  async ngOnInit(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.negocios = await this.api.misEmprendimientos(); }
    catch { this.mensaje = 'No se pudieron cargar tus emprendimientos.'; }
  }
}
