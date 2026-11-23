import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { EstadoPostulacion } from '../../modelos/chambafast';
import { PostulacionesOferta } from './postulaciones-oferta';

describe('Revisión de postulaciones', () => {
  it('actualiza el estado al aceptar y conserva al postulante de la oferta', async () => {
    let estado: EstadoPostulacion = 'enviada';
    const cambiar = vi.fn(async (_id: number, nuevo: EstadoPostulacion) => { estado = nuevo; });
    await TestBed.configureTestingModule({ imports: [PostulacionesOferta], providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } } },
      { provide: ApiChambaFast, useValue: {
        postulacionesDeOferta: async () => [{ id: 9, usuario_id: 8, oferta_id: 42,
          mensaje: 'Me interesa', estado, fecha_postulacion: '2026-11-23T12:00:00' }],
        cambiarEstadoPostulacion: cambiar,
      } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(PostulacionesOferta);
    await fixture.whenStable();
    await fixture.componentInstance.cambiar(9, 'aceptada');
    await fixture.whenStable();
    expect(cambiar).toHaveBeenCalledWith(9, 'aceptada');
    expect(fixture.nativeElement.querySelector('article')?.textContent).toContain('Aceptada');
    expect(fixture.nativeElement.querySelector('article')?.textContent).toContain('Postulante #8');
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
  });
});
