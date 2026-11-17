import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Emprendimiento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  icono: string;
}

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './emprendimientos.html',
  styleUrl: './emprendimientos.css'
})
export class EmprendimientosComponent {

  // Categorías disponibles
  categorias: string[] = [
    'Todos',
    'Alimentos',
    'Ropa y accesorios',
    'Tecnología',
    'Belleza',
    'Servicios',
    'Artesanía'
  ];

  // Categoría seleccionada inicialmente
  categoriaSeleccionada = 'Todos';

  // Emprendimientos de ejemplo
  emprendimientos: Emprendimiento[] = [
    {
      id: 1,
      nombre: 'Dulce Tentación',
      categoria: 'Alimentos',
      descripcion: 'Elaboración de tortas, postres y bocaditos para todo tipo de eventos.',
      ubicacion: 'Huancayo, Junín',
      tipo: 'Productos',
      icono: '🍰'
    },
    {
      id: 2,
      nombre: 'Moda Urbana',
      categoria: 'Ropa y accesorios',
      descripcion: 'Venta de prendas modernas, polos, pantalones y accesorios.',
      ubicacion: 'El Tambo, Huancayo',
      tipo: 'Productos',
      icono: '👕'
    },
    {
      id: 3,
      nombre: 'Soluciones Digitales',
      categoria: 'Tecnología',
      descripcion: 'Desarrollo de páginas web, soporte técnico y mantenimiento de computadoras.',
      ubicacion: 'Huancayo, Junín',
      tipo: 'Servicios',
      icono: '💻'
    },
    {
      id: 4,
      nombre: 'Belleza Natural',
      categoria: 'Belleza',
      descripcion: 'Servicios de maquillaje, cuidado facial y tratamientos de belleza.',
      ubicacion: 'Chilca, Huancayo',
      tipo: 'Servicios',
      icono: '💄'
    },
    {
      id: 5,
      nombre: 'Artesanías Andinas',
      categoria: 'Artesanía',
      descripcion: 'Productos artesanales elaborados a mano con diseños tradicionales.',
      ubicacion: 'Huancayo, Junín',
      tipo: 'Productos',
      icono: '🧶'
    },
    {
      id: 6,
      nombre: 'Eventos Creativos',
      categoria: 'Servicios',
      descripcion: 'Decoración y organización de eventos sociales y empresariales.',
      ubicacion: 'Huancayo, Junín',
      tipo: 'Servicios',
      icono: '🎉'
    }
  ];

  // Filtrar emprendimientos según la categoría seleccionada
  get emprendimientosFiltrados(): Emprendimiento[] {

    if (this.categoriaSeleccionada === 'Todos') {
      return this.emprendimientos;
    }

    return this.emprendimientos.filter(
      emprendimiento =>
        emprendimiento.categoria === this.categoriaSeleccionada
    );
  }

  // Cambiar la categoría seleccionada
  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
  }

}
