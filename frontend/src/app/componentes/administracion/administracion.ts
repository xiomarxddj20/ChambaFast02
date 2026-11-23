import { Component, inject, OnInit } from '@angular/core';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Usuario } from '../../modelos/chambafast';

@Component({ selector: 'app-administracion', standalone: true, imports: [],
  templateUrl: './administracion.html', styleUrl: './administracion.css' })
export class Administracion implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  usuarios: Usuario[] = []; mensaje = '';
  ngOnInit(): void { void this.cargar(); }
  async cargar(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    try { this.usuarios = await this.api.listarUsuarios(); }
    catch { this.mensaje = 'No se pudo acceder a los usuarios.'; }
  }
  async cambiarEstado(usuario: Usuario): Promise<void> {
    if (!this.api) return;
    try { await this.api.cambiarEstadoUsuario(usuario.id, !usuario.activo); await this.cargar(); }
    catch { this.mensaje = 'No se pudo actualizar la cuenta.'; }
  }
}
