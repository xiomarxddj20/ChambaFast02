import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Usuario } from '../../modelos/chambafast';

@Component({ selector: 'app-navbar', standalone: true, imports: [RouterLink],
  templateUrl: './navbar.html', styleUrl: './navbar.css' })
export class Navbar implements OnInit, OnDestroy {
  private api = inject(ApiChambaFast, { optional: true });
  private router = inject(Router);
  private detector = inject(ChangeDetectorRef);
  private ultimaConsulta = 0;
  private subscripcion?: Subscription;
  usuario: Usuario | null = null;

  ngOnInit(): void {
    void this.actualizarUsuario();
    this.subscripcion = this.router.events.subscribe(evento => {
      if (evento instanceof NavigationEnd) void this.actualizarUsuario();
    });
  }
  ngOnDestroy(): void {
    this.ultimaConsulta++;
    this.subscripcion?.unsubscribe();
  }

  async actualizarUsuario(): Promise<void> {
    if (!this.api) return;
    const consulta = ++this.ultimaConsulta;
    try {
      const usuario = await this.api.usuarioActual();
      if (consulta === this.ultimaConsulta) this.usuario = usuario;
    } catch {
      // Un error de red no significa que la cuenta haya cerrado sesión.
      // usuarioActual devuelve null cuando realmente no hay sesión válida.
    } finally {
      if (consulta === this.ultimaConsulta) this.detector.markForCheck();
    }
  }

  get panel(): string {
    if (this.usuario?.rol === 'empresa') return '/mis-ofertas';
    if (this.usuario?.rol === 'admin') return '/administracion';
    return '/mis-postulaciones';
  }

  async salir(): Promise<void> {
    if (!this.api) return;
    this.ultimaConsulta++;
    await this.api.cerrarSesion();
    this.usuario = null;
    this.detector.markForCheck();
    await this.router.navigate(['/']);
  }
}
