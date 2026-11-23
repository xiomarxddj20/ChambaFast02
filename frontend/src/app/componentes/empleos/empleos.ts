import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { CategoriaOferta, OfertaLaboral } from '../../modelos/chambafast';

@Component({
  selector: 'app-empleos', standalone: true, imports: [RouterLink],
  templateUrl: './empleos.html', styleUrl: './empleos.css',
})
export class Empleos implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private detector = inject(ChangeDetectorRef);
  private ultimaConsulta = 0;
  categorias: ('Todos' | CategoriaOferta)[] = ['Todos', 'Administración', 'Tecnología', 'Ventas', 'Atención al cliente', 'Marketing', 'Diseño'];
  categoriaSeleccionada: 'Todos' | CategoriaOferta = 'Todos';
  ofertasPublicadas: OfertaLaboral[] = [];
  mensaje = '';

  ngOnInit(): void { void this.cargarOfertas(); }

  async cargarOfertas(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    const consulta = ++this.ultimaConsulta;
    try {
      const categoria = this.categoriaSeleccionada === 'Todos' ? undefined : this.categoriaSeleccionada;
      const ofertas = await this.api.listarOfertas(categoria);
      if (consulta !== this.ultimaConsulta) return;
      this.ofertasPublicadas = ofertas;
      this.mensaje = '';
    } catch {
      if (consulta === this.ultimaConsulta) this.mensaje = 'No se pudieron cargar las ofertas.';
    } finally {
      if (consulta === this.ultimaConsulta) this.detector.markForCheck();
    }
  }

  seleccionarCategoria(categoria: 'Todos' | CategoriaOferta): void {
    this.categoriaSeleccionada = categoria;
    void this.cargarOfertas();
  }
}
