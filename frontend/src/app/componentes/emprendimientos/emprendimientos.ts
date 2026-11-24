import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { CategoriaNegocio, Emprendimiento } from '../../modelos/chambafast';

@Component({ selector: 'app-emprendimientos', standalone: true, imports: [RouterLink],
  templateUrl: './emprendimientos.html', styleUrl: './emprendimientos.css' })
export class Emprendimientos implements OnInit {
  private api = inject(ApiChambaFast, { optional: true });
  private detector = inject(ChangeDetectorRef);
  private ultimaConsulta = 0;
  categorias: ('Todos' | CategoriaNegocio)[] = [
    'Todos', 'Alimentos', 'Ropa y accesorios', 'Tecnología', 'Belleza', 'Servicios', 'Artesanía'
  ];
  categoriaSeleccionada: 'Todos' | CategoriaNegocio = 'Todos';
  emprendimientosFiltrados: Emprendimiento[] = [];
  mensaje = '';
  ngOnInit(): void { void this.cargar(); }
  async cargar(): Promise<void> {
    if (!this.api) { this.mensaje = 'Pendiente integrar con FastAPI.'; return; }
    const consulta = ++this.ultimaConsulta;
    try {
      const categoria = this.categoriaSeleccionada === 'Todos' ? undefined : this.categoriaSeleccionada;
      const negocios = await this.api.listarEmprendimientos(categoria);
      if (consulta !== this.ultimaConsulta) return;
      this.emprendimientosFiltrados = negocios;
      this.mensaje = '';
    } catch {
      if (consulta === this.ultimaConsulta) this.mensaje = 'No se pudo cargar el catálogo.';
    } finally {
      if (consulta === this.ultimaConsulta) this.detector.markForCheck();
    }
  }
  seleccionarCategoria(categoria: 'Todos' | CategoriaNegocio): void {
    this.categoriaSeleccionada = categoria;
    void this.cargar();
  }
}
