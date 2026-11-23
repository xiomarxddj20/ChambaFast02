import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Oferta } from './oferta';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaLaboral } from '../../modelos/chambafast';

describe('Oferta', () => {
  let component: Oferta;
  let fixture: ComponentFixture<Oferta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oferta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Oferta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Carga asíncrona del detalle de oferta', () => {
  let fixture: ComponentFixture<Oferta>;
  let resolver: (oferta: OfertaLaboral) => void;
  let rechazar: (error: Error) => void;
  let idConsultado: number | undefined;
  const oferta: OfertaLaboral = {
    id: 42, usuario_id: 7, cargo: 'Desarrollador Angular', empresa: 'Empresa demo',
    categoria: 'Tecnología', descripcion: 'Desarrollo de aplicaciones web.',
    requisitos: 'Experiencia con Angular.', ubicacion: 'Lima', modalidad: 'Remoto',
    salario: 'A tratar', estado: 'publicada', fecha_publicacion: '2026-11-23T00:00:00',
  };

  beforeEach(async () => {
    idConsultado = undefined;
    await TestBed.configureTestingModule({
      imports: [Oferta],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: {
          snapshot: { paramMap: convertToParamMap({ id: '42' }) },
        } },
        { provide: ApiChambaFast, useValue: {
          detalleOferta: (id: number) => {
            idConsultado = id;
            return new Promise<OfertaLaboral>((resolve, reject) => {
              resolver = resolve;
              rechazar = reject;
            });
          },
        } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Oferta);
    await fixture.whenStable();
  });

  it('consulta el ID de la ruta y muestra la oferta al recibirla', async () => {
    expect(idConsultado).toBe(42);
    resolver(oferta);
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1')?.textContent)
      .toContain('Desarrollador Angular');
    expect(fixture.nativeElement.querySelector('.btn-postular')?.getAttribute('href'))
      .toBe('/empleos/42/postular');
  });

  it('muestra un aviso cuando falla la consulta', async () => {
    rechazar(new Error('Oferta no encontrada'));
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('La oferta no se encontró');
  });
});
