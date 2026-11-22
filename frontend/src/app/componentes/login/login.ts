import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  correo = '';
  contrasena = '';
  mensaje = '';

  iniciarSesion(): void {
    if (!this.correo || !this.contrasena) {
      this.mensaje = 'Completa todos los campos.';
      return;
    }

    this.mensaje = 'Formulario validado. Próximamente se conectará con el servidor.';
  }
}