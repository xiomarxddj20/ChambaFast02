import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { RegistroDatos } from '../../modelos/chambafast';

@Component({
  selector: 'app-registro', standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html', styleUrl: './registro.css',
})
export class Registro {
  private api = inject(ApiChambaFast, { optional: true });
  private router = inject(Router);
  private detector = inject(ChangeDetectorRef);
  nombre = ''; apellido = ''; correo = ''; telefono = '';
  tipoUsuario = ''; contrasena = ''; confirmarContrasena = '';
  mensaje = ''; procesando = false;

  async registrarUsuario(): Promise<void> {
    if (!this.nombre.trim() || !this.apellido.trim() || !this.correo.trim() ||
        !this.telefono.trim() || !this.tipoUsuario || !this.contrasena || !this.confirmarContrasena) {
      this.mensaje = 'Completa todos los campos.'; return;
    }
    if (this.tipoUsuario !== 'postulante' && this.tipoUsuario !== 'empresa') {
      this.mensaje = 'Selecciona un perfil válido.'; return;
    }
    if (this.contrasena.length < 8 || this.contrasena.length > 64) {
      this.mensaje = 'La contraseña debe tener entre 8 y 64 caracteres.'; return;
    }
    if (this.contrasena !== this.confirmarContrasena) {
      this.mensaje = 'Las contraseñas no coinciden.'; return;
    }
    if (!this.api) { this.mensaje = 'La integración con FastAPI todavía no está configurada.'; return; }

    const datos: RegistroDatos = {
      nombre: this.nombre.trim(), apellido: this.apellido.trim(),
      correo: this.correo.trim(), telefono: this.telefono.trim(),
      rol: this.tipoUsuario, contrasena: this.contrasena,
    };
    this.procesando = true;
    try {
      const respuesta = await this.api.registrar(datos);
      await this.router.navigate([respuesta.usuario.rol === 'empresa' ? '/mis-ofertas' : '/mis-postulaciones']);
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo completar el registro.';
    } finally {
      this.procesando = false;
      this.detector.markForCheck();
    }
  }
}
