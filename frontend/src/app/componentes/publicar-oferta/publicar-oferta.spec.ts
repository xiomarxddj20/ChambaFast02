import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicarOferta } from './publicar-oferta';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';

describe('PublicarOferta', () => {
  let component: PublicarOferta;
  let fixture: ComponentFixture<PublicarOferta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarOferta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicarOferta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Errores al publicar una oferta', () => {
  it('muestra el error asíncrono y permite volver a enviar el formulario', async () => {
    let rechazar!: (error: Error) => void;
    await TestBed.configureTestingModule({ imports: [PublicarOferta], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        crearOferta: () => new Promise((_resolve, reject) => { rechazar = reject; }),
      } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(PublicarOferta);
    await fixture.whenStable();
    Object.assign(fixture.componentInstance.oferta, { cargo: 'Vendedor', empresa: 'Demo',
      ubicacion: 'Lima', descripcion: 'Venta de productos para clientes', requisitos: 'Experiencia en ventas' });
    const pendiente = fixture.componentInstance.publicar();
    rechazar(new Error('No se pudo conectar con el servidor.'));
    await pendiente;
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('No se pudo conectar con el servidor.');
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });
});
