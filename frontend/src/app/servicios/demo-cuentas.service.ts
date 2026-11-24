import { Injectable, inject } from '@angular/core';
import { DatosDemo } from './demo-datos.service';
import { RegistroDatos, TokenRespuesta, Usuario } from '../modelos/chambafast';

@Injectable({ providedIn: 'root' })
export class DemoCuentas {
  private datos = inject(DatosDemo);

  registrar(registro: RegistroDatos): TokenRespuesta {
    const correo = registro.correo.trim().toLowerCase();
    if (this.datos.cuentas.some(u => u.correo === correo)) throw new Error('Este correo ya está registrado.');
    if (!['empresa', 'postulante'].includes(registro.rol)) throw new Error('Rol incorrecto.');
    if (registro.contrasena.length < 8 || registro.contrasena.length > 64) throw new Error('La contraseña debe tener de 8 a 64 caracteres.');
    const cuenta = {
      id: this.datos.siguienteId(this.datos.cuentas),
      nombre: registro.nombre.trim(), apellido: registro.apellido.trim(), correo,
      telefono: registro.telefono.trim(), rol: registro.rol,
      activo: true, clave: registro.contrasena,
    };
    this.datos.cuentas.push(cuenta);
    this.datos.sesion = cuenta.id;
    return this.respuesta();
  }

  login(correo: string, clave: string): TokenRespuesta {
    const cuenta = this.datos.cuentas.find(u => u.correo === correo.trim().toLowerCase() && u.clave === clave);
    if (!cuenta || !cuenta.activo) throw new Error('Correo o contraseña incorrectos.');
    this.datos.sesion = cuenta.id;
    return this.respuesta();
  }

  usuarioActual(): Usuario | null { return this.datos.usuario(); }
  cerrarSesion(): void { this.datos.sesion = null; }

  listarUsuarios(): Usuario[] {
    this.datos.exigirRol('admin');
    return this.datos.cuentas.map(({ clave: _clave, ...usuario }) => ({ ...usuario }));
  }

  cambiarEstadoUsuario(id: number, activo: boolean): Usuario {
    const admin = this.datos.exigirRol('admin');
    if (admin.id === id) throw new Error('No puedes desactivar tu propia cuenta.');
    const cuenta = this.datos.cuentas.find(u => u.id === id);
    if (!cuenta) throw new Error('Usuario no encontrado.');
    cuenta.activo = activo;
    const { clave: _clave, ...publico } = cuenta;
    return { ...publico };
  }

  private respuesta(): TokenRespuesta {
    return {
      access_token: 'TOKEN_DEMO_SIN_VALIDEZ', token_type: 'bearer', expires_in: 0,
      usuario: this.datos.exigirUsuario(),
    };
  }
}
