import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Emprendimiento } from '../../modelos/chambafast';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { MisEmprendimientos } from './mis-emprendimientos';

describe('MisEmprendimientos', () => {
  let fixture: ComponentFixture<MisEmprendimientos>;
  let component: MisEmprendimientos;
  const negocio: Emprendimiento = {
    id: 12, usuario_id: 7, nombre: 'Café local', categoria: 'Alimentos',
    descripcion: 'Venta de café de productores locales.', ubicacion: 'Huancayo',
    tipo: 'Productos', contacto: 'cafe@example.test', estado: 'publicado', fecha_publicacion: '',
  };
  function crearApi() {
    return {
      misEmprendimientos: vi.fn(async (): Promise<Emprendimiento[]> => [{ ...negocio }]),
      ocultarEmprendimiento: vi.fn(async (_id: number): Promise<Emprendimiento> => ({ ...negocio, estado: 'oculto' })),
      reactivarEmprendimiento: vi.fn(async (_id: number): Promise<Emprendimiento> => ({ ...negocio, estado: 'publicado' })),
    };
  }
  let api: ReturnType<typeof crearApi>;

  beforeEach(async () => {
    api = crearApi();
    await TestBed.configureTestingModule({
      imports: [MisEmprendimientos],
      providers: [provideRouter([]), { provide: ApiChambaFast, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(MisEmprendimientos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('carga y muestra los negocios de la cuenta', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    expect(api.misEmprendimientos).toHaveBeenCalled();
    expect(component.negocios).toEqual([negocio]);
    expect(fixture.nativeElement.querySelector('article')?.textContent).toContain('Café local');
  });

  it('oculta un negocio publicado y actualiza la lista', async () => {
    api.misEmprendimientos.mockResolvedValue([{ ...negocio, estado: 'oculto' }]);
    await component.actualizarEstado(negocio);
    expect(api.ocultarEmprendimiento).toHaveBeenCalledWith(12);
    expect(api.reactivarEmprendimiento).not.toHaveBeenCalled();
    expect(component.negocios[0].estado).toBe('oculto');
  });

  it('reactiva un negocio oculto', async () => {
    await component.actualizarEstado({ ...negocio, estado: 'oculto' });
    expect(api.reactivarEmprendimiento).toHaveBeenCalledWith(12);
    expect(api.ocultarEmprendimiento).not.toHaveBeenCalled();
    expect(component.negocios[0].estado).toBe('publicado');
  });

  it('informa si falla la carga de negocios', async () => {
    api.misEmprendimientos.mockRejectedValue(new Error('Error de consulta'));
    await component.ngOnInit();
    expect(component.mensaje).toBe('No se pudieron cargar tus emprendimientos.');
  });

  it('informa si falla el cambio de estado', async () => {
    api.ocultarEmprendimiento.mockRejectedValue(new Error('Error de actualización'));
    await component.actualizarEstado(negocio);
    expect(component.mensaje).toBe('No se pudo cambiar el estado del negocio.');
  });
});
