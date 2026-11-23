import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empleos } from './empleos';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaLaboral } from '../../modelos/chambafast';

describe('Empleos', () => {
  let component: Empleos;
  let fixture: ComponentFixture<Empleos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Empleos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Empleos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Filtro universal de empleos', () => {
  const ofertas: OfertaLaboral[] = [
    { id: 1, usuario_id: 7, cargo: 'Desarrollador', empresa: 'Demo', categoria: 'Tecnología',
      descripcion: 'Desarrollo de aplicaciones', requisitos: 'Experiencia en desarrollo',
      ubicacion: 'Lima', modalidad: 'Remoto', salario: '', estado: 'publicada', fecha_publicacion: '' },
    { id: 2, usuario_id: 7, cargo: 'Vendedor', empresa: 'Demo', categoria: 'Ventas',
      descripcion: 'Venta de productos', requisitos: 'Experiencia en ventas',
      ubicacion: 'Lima', modalidad: 'Presencial', salario: '', estado: 'publicada', fecha_publicacion: '' },
  ];
  let fixture: ComponentFixture<Empleos>;
  let consultas: { categoria?: string; resolver: (datos: OfertaLaboral[]) => void }[];

  beforeEach(async () => {
    consultas = [];
    await TestBed.configureTestingModule({ imports: [Empleos], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        listarOfertas: (categoria?: string) => new Promise<OfertaLaboral[]>(resolver => {
          consultas.push({ categoria, resolver });
        }),
      } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(Empleos);
    await fixture.whenStable();
  });

  async function responder(indice: number, datos: OfertaLaboral[]) {
    consultas[indice].resolver(datos);
    await Promise.resolve();
    await fixture.whenStable();
  }

  it('muestra todas las categorías en la carga inicial', async () => {
    expect(consultas[0].categoria).toBeUndefined();
    await responder(0, ofertas);
    expect(fixture.nativeElement.querySelectorAll('article.oferta').length).toBe(2);
  });

  it('quita el filtro al volver de una categoría a Todos', async () => {
    await responder(0, ofertas);
    fixture.componentInstance.seleccionarCategoria('Tecnología');
    expect(consultas[1].categoria).toBe('Tecnología');
    await responder(1, [ofertas[0]]);
    fixture.componentInstance.seleccionarCategoria('Todos');
    expect(consultas[2].categoria).toBeUndefined();
    await responder(2, ofertas);
    expect(fixture.nativeElement.querySelectorAll('article.oferta').length).toBe(2);
  });

  it('no permite que una respuesta antigua reemplace Todos', async () => {
    await responder(0, ofertas);
    fixture.componentInstance.seleccionarCategoria('Tecnología');
    fixture.componentInstance.seleccionarCategoria('Todos');
    await responder(2, ofertas);
    await responder(1, [ofertas[0]]);
    expect(fixture.componentInstance.categoriaSeleccionada).toBe('Todos');
    expect(fixture.componentInstance.ofertasPublicadas).toEqual(ofertas);
  });
});
