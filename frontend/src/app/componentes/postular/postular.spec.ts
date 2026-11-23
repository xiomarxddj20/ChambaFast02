import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Postular } from './postular';

describe('Envío de postulación', () => {
  async function preparar() {
    let resolver!: (valor: unknown) => void;
    let rechazar!: (error: Error) => void;
    let datos: unknown[] = [];
    await TestBed.configureTestingModule({
      imports: [Postular], providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {
          paramMap: convertToParamMap({ id: '42' }),
        } } },
        { provide: ApiChambaFast, useValue: {
          postular: (...argumentos: unknown[]) => {
            datos = argumentos;
            return new Promise((resolve, reject) => { resolver = resolve; rechazar = reject; });
          },
        } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Postular);
    await fixture.whenStable();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const campo = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    campo.value = 'Me interesa esta oferta';
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    return { fixture, navegar, resolver, rechazar, datos };
  }

  it('envía el ID y mensaje correctos y navega al historial al recibir éxito', async () => {
    const prueba = await preparar();
    expect(prueba.datos).toEqual([42, 'Me interesa esta oferta']);
    expect(prueba.fixture.nativeElement.querySelector('button').disabled).toBe(true);
    prueba.resolver({ id: 9 });
    await Promise.resolve();
    await Promise.resolve();
    await prueba.fixture.whenStable();
    expect(prueba.navegar).toHaveBeenCalledWith(['/mis-postulaciones']);
    expect(prueba.fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });

  it('muestra el rechazo y desbloquea el botón sin navegar', async () => {
    const prueba = await preparar();
    prueba.rechazar(new Error('Ya postulaste a esta oferta'));
    await Promise.resolve();
    await prueba.fixture.whenStable();
    expect(prueba.fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('Ya postulaste a esta oferta');
    expect(prueba.fixture.nativeElement.querySelector('button').disabled).toBe(false);
    expect(prueba.navegar).not.toHaveBeenCalled();
  });
});
