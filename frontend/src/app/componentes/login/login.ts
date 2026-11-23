import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';

@Component({
  selector: 'app-login', standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html', styleUrl: './login.css',
})
export class Login {
  private api = inject(ApiChambaFast, { optional: true });
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  correo = ''; contrasena = ''; mensaje = ''; procesando = false;

  async iniciarSesion(): Promise<void> {
    if (!this.correo.trim() || !this.contrasena) {
      this.mensaje = 'Completa todos los campos.'; return;
    }
    if (!this.api) { this.mensaje = 'La integración con FastAPI todavía no está configurada.'; return; }
    this.procesando = true;
    try {
      const respuesta = await this.api.login(this.correo.trim(), this.contrasena);
      const guardado = this.ruta.snapshot.queryParamMap.get('destino');
      const destinoGuardado = guardado && guardado.startsWith('/') &&
        !guardado.startsWith('//') ? guardado : null;
      const destino = destinoGuardado ?? (respuesta.usuario.rol === 'empresa'
        ? '/mis-ofertas'
        : respuesta.usuario.rol === 'admin' ? '/administracion' : '/mis-postulaciones');
      await this.router.navigateByUrl(destino);
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
    } finally { this.procesando = false; }
  }
}
