import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  nombre = '';
  apellido = '';
  correo = '';
  telefono = '';
  tipoUsuario = '';
  contrasena = '';
  confirmarContrasena = '';
  mensaje = '';

  registrarUsuario(): void {

    if (
      !this.nombre ||
      !this.apellido ||
      !this.correo ||
      !this.telefono ||
      !this.tipoUsuario ||
      !this.contrasena ||
      !this.confirmarContrasena
    ) {
      this.mensaje = 'Completa todos los campos.';
      return;
    }

    if (this.contrasena.length < 8) {
      this.mensaje = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.mensaje = 'Formulario validado. Próximamente podrás crear tu cuenta.';
  }
}