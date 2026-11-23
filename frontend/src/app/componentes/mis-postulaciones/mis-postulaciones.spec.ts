import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Postulacion } from '../../modelos/chambafast';
import { MisPostulaciones } from './mis-postulaciones';

describe('Historial de postulaciones', () => {
  async function preparar() {
    let resolver!: (datos: Postulacion[]) => void;
    let rechazar!: (error: Error) => void;
    await TestBed.configureTestingModule({ imports: [MisPostulaciones], providers: [
      provideRouter([]), { provide: ApiChambaFast, useValue: {
        misPostulaciones: () => new Promise<Postulacion[]>((resolve, reject) => {
          resolver = resolve; rechazar = reject;
        }),
      } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(MisPostulaciones);
    await fixture.whenStable();
    return { fixture, resolver, rechazar };
  }

  it('muestra la postulación cuando llega la respuesta', async () => {
    const prueba = await preparar();
    prueba.resolver([{ id: 9, oferta_id: 42, usuario_id: 7, mensaje: '',
      estado: 'enviada', fecha_postulacion: '2026-11-23T12:00:00' }]);
    await Promise.resolve();
    await prueba.fixture.whenStable();
    expect(prueba.fixture.nativeElement.querySelector('article')?.textContent)
      .toContain('Oferta #42');
    expect(prueba.fixture.nativeElement.querySelector('strong')?.textContent).toBe('Enviada');
  });

  it('muestra En revisión sin cambiar el código de estado recibido', async () => {
    const prueba = await preparar();
    prueba.resolver([{ id: 9, oferta_id: 42, usuario_id: 7, mensaje: '',
      estado: 'en_revision', fecha_postulacion: '2026-11-23T12:00:00' }]);
    await Promise.resolve();
    await prueba.fixture.whenStable();
    expect(prueba.fixture.nativeElement.querySelector('strong')?.textContent).toBe('En revisión');
    expect(prueba.fixture.componentInstance.postulaciones[0].estado).toBe('en_revision');
  });

  it('muestra un aviso si no se pudo consultar el historial', async () => {
    const prueba = await preparar();
    prueba.rechazar(new Error('Error de conexión'));
    await Promise.resolve();
    await prueba.fixture.whenStable();
    expect(prueba.fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('No se pudo consultar tu historial.');
  });
});
