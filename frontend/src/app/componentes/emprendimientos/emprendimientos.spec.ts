import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Emprendimientos } from './emprendimientos';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Emprendimiento } from '../../modelos/chambafast';

describe('Emprendimientos', () => {
  let component: Emprendimientos;
  let fixture: ComponentFixture<Emprendimientos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emprendimientos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Emprendimientos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Filtro universal de emprendimientos', () => {
  const negocios: Emprendimiento[] = [
    { id: 1, usuario_id: 7, nombre: 'Café Demo', categoria: 'Alimentos',
      descripcion: 'Café artesanal de la región', ubicacion: 'Lima', tipo: 'Productos',
      contacto: '999999999', estado: 'publicado', fecha_publicacion: '' },
    { id: 2, usuario_id: 7, nombre: 'Soporte Demo', categoria: 'Tecnología',
      descripcion: 'Soporte de equipos informáticos', ubicacion: 'Lima', tipo: 'Servicios',
      contacto: '999999999', estado: 'publicado', fecha_publicacion: '' },
  ];
  let fixture: ComponentFixture<Emprendimientos>;
  let consultas: { categoria?: string; resolver: (datos: Emprendimiento[]) => void }[];

  beforeEach(async () => {
    consultas = [];
    await TestBed.configureTestingModule({ imports: [Emprendimientos], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        listarEmprendimientos: (categoria?: string) => new Promise<Emprendimiento[]>(resolver => {
          consultas.push({ categoria, resolver });
        }),
      } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(Emprendimientos);
    await fixture.whenStable();
  });

  async function responder(indice: number, datos: Emprendimiento[]) {
    consultas[indice].resolver(datos);
    await Promise.resolve();
    await fixture.whenStable();
  }

  it('muestra todas las categorías en la carga inicial', async () => {
    expect(consultas[0].categoria).toBeUndefined();
    await responder(0, negocios);
    expect(fixture.nativeElement.textContent).toContain('Café Demo');
    expect(fixture.nativeElement.textContent).toContain('Soporte Demo');
  });

  it('quita el filtro al volver de una categoría a Todos', async () => {
    await responder(0, negocios);
    fixture.componentInstance.seleccionarCategoria('Alimentos');
    expect(consultas[1].categoria).toBe('Alimentos');
    await responder(1, [negocios[0]]);
    fixture.componentInstance.seleccionarCategoria('Todos');
    expect(consultas[2].categoria).toBeUndefined();
    await responder(2, negocios);
    expect(fixture.nativeElement.textContent).toContain('Café Demo');
    expect(fixture.nativeElement.textContent).toContain('Soporte Demo');
  });

  it('no permite que una respuesta antigua reemplace Todos', async () => {
    await responder(0, negocios);
    fixture.componentInstance.seleccionarCategoria('Alimentos');
    fixture.componentInstance.seleccionarCategoria('Todos');
    await responder(2, negocios);
    await responder(1, [negocios[0]]);
    expect(fixture.componentInstance.categoriaSeleccionada).toBe('Todos');
    expect(fixture.componentInstance.emprendimientosFiltrados).toEqual(negocios);
  });
});
