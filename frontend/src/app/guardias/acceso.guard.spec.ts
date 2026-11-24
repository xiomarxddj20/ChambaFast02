import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { ApiChambaFast } from '../servicios/puerto-api';
import { rolGuard } from './acceso.guard';

describe('Permisos de navegación', () => {
  const usuario = { id: 1, nombre: 'Ana', apellido: 'Perez', correo: 'ana@example.com',
    telefono: '999999999', rol: 'postulante', activo: true };
  let actual: typeof usuario | null;

  beforeEach(() => {
    actual = null;
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: { usuarioActual: async () => actual } }] });
  });

  async function evaluar() {
    const guard = rolGuard('empresa');
    return await TestBed.runInInjectionContext(() => guard(
      {} as ActivatedRouteSnapshot, { url: '/publicar-oferta' } as RouterStateSnapshot));
  }

  it('conserva el destino cuando no hay sesión', async () => {
    const resultado = await evaluar();
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(resultado as ReturnType<Router['createUrlTree']>))
      .toBe('/login?destino=%2Fpublicar-oferta');
  });

  it('rechaza el rol postulante en publicación', async () => {
    actual = usuario;
    const resultado = await evaluar();
    expect(TestBed.inject(Router).serializeUrl(resultado as ReturnType<Router['createUrlTree']>))
      .toBe('/mis-postulaciones');
  });

  it('permite publicar al rol empresa', async () => {
    actual = { ...usuario, rol: 'empresa' };
    expect(await evaluar()).toBe(true);
  });

  it('no manda al login por un error temporal del servidor', async () => {
    vi.spyOn(TestBed.inject(ApiChambaFast), 'usuarioActual').mockRejectedValue(new Error('Error de red'));
    expect(await evaluar()).toBe(false);
  });
});
