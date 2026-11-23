import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { OfertaLaboral } from '../../modelos/chambafast';
import { MisOfertas } from './mis-ofertas';

describe('Ofertas vinculadas a la empresa', () => {
  it('muestra las ofertas del panel al terminar la consulta', async () => {
    let resolver!: (datos: OfertaLaboral[]) => void;
    await TestBed.configureTestingModule({ imports: [MisOfertas], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        misOfertas: () => new Promise<OfertaLaboral[]>(resolve => { resolver = resolve; }),
      } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(MisOfertas);
    await fixture.whenStable();
    resolver([{ id: 42, usuario_id: 7, cargo: 'Oferta de mi empresa', empresa: 'Demo',
      categoria: 'Ventas', descripcion: 'Venta de productos', requisitos: 'Experiencia en ventas',
      ubicacion: 'Lima', modalidad: 'Presencial', salario: '', estado: 'publicada', fecha_publicacion: '' }]);
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('article')?.textContent).toContain('Oferta de mi empresa');
    expect(fixture.componentInstance.ofertas[0].usuario_id).toBe(7);
  });

  it('ofrece reabrir una cerrada y muestra Editar después de reabrir', async () => {
    const oferta: OfertaLaboral = { id: 42, usuario_id: 7, cargo: 'Vendedor', empresa: 'Demo',
      categoria: 'Ventas', descripcion: 'Venta de productos', requisitos: 'Experiencia en ventas',
      ubicacion: 'Lima', modalidad: 'Presencial', salario: '', estado: 'cerrada', fecha_publicacion: '' };
    let resolver!: () => void;
    const reabrir = vi.fn(() => new Promise<void>(resolve => {
      resolver = () => { oferta.estado = 'publicada'; resolve(); };
    }));
    await TestBed.configureTestingModule({ imports: [MisOfertas], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        misOfertas: async () => [{ ...oferta }], reabrirOferta: reabrir,
      } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(MisOfertas);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Editar');
    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent).toContain('Reabrir oferta');
    boton.click();
    await fixture.whenStable();
    expect(boton.disabled).toBe(true);
    await fixture.componentInstance.reabrir(42);
    expect(reabrir).toHaveBeenCalledTimes(1);
    resolver();
    await Promise.resolve();
    await Promise.resolve();
    await fixture.whenStable();
    expect(reabrir).toHaveBeenCalledWith(42);
    expect(fixture.nativeElement.textContent).toContain('Editar');
    expect(fixture.nativeElement.textContent).toContain('Cerrar oferta');
    expect(fixture.nativeElement.textContent).not.toContain('Reabrir oferta');
  });
});
