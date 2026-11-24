import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Emprendimiento, EmprendimientoDatos } from '../../modelos/chambafast';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { PublicarEmprendimiento } from './publicar-emprendimiento';

describe('PublicarEmprendimiento', () => {
  const datos: EmprendimientoDatos = {
    nombre: 'Café local', categoria: 'Alimentos', descripcion: 'Venta de café de productores locales.',
    ubicacion: 'Huancayo', tipo: 'Productos', contacto: 'cafe@example.test',
  };
  const negocio: Emprendimiento = {
    ...datos, id: 12, usuario_id: 7, estado: 'publicado', fecha_publicacion: '',
  };

  async function preparar(id: string | null = null) {
    const api = {
      detalleEmprendimiento: vi.fn(async (_id: number) => ({ ...negocio })),
      crearEmprendimiento: vi.fn(async (valores: EmprendimientoDatos) => ({ ...negocio, ...valores })),
      actualizarEmprendimiento: vi.fn(async (_id: number, valores: EmprendimientoDatos) => ({ ...negocio, ...valores })),
    };
    await TestBed.configureTestingModule({
      imports: [PublicarEmprendimiento],
      providers: [provideRouter([]), { provide: ApiChambaFast, useValue: api }],
    }).compileComponents();
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot.paramMap, 'get').mockReturnValue(id);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture: ComponentFixture<PublicarEmprendimiento> = TestBed.createComponent(PublicarEmprendimiento);
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, api, navegar };
  }

  it('inicia un formulario nuevo sin consultar un negocio anterior', async () => {
    const { fixture, component, api } = await preparar();
    expect(component.editandoId).toBeNull();
    expect(component.negocio.nombre).toBe('');
    expect(api.detalleEmprendimiento).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('rechaza un formulario incompleto y no realiza el guardado', async () => {
    const { component, api, navegar } = await preparar();
    await component.guardar();
    expect(component.mensaje).toBe('Completa los campos obligatorios.');
    expect(api.crearEmprendimiento).not.toHaveBeenCalled();
    expect(api.actualizarEmprendimiento).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('publica un negocio válido y navega al panel', async () => {
    const { component, api, navegar } = await preparar();
    component.negocio = { ...datos };
    await component.guardar();
    expect(api.crearEmprendimiento).toHaveBeenCalledWith(datos);
    expect(api.actualizarEmprendimiento).not.toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/mis-emprendimientos']);
    expect(component.procesando).toBe(false);
  });

  it('carga los datos existentes y actualiza el negocio al editar', async () => {
    const { component, api, navegar } = await preparar('12');
    expect(component.editandoId).toBe(12);
    expect(api.detalleEmprendimiento).toHaveBeenCalledWith(12);
    expect(component.negocio).toEqual(datos);
    component.negocio.nombre = 'Café renovado';
    await component.guardar();
    expect(api.actualizarEmprendimiento).toHaveBeenCalledWith(12, { ...datos, nombre: 'Café renovado' });
    expect(api.crearEmprendimiento).not.toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/mis-emprendimientos']);
  });

  it('muestra el error y permite reintentar si falla la publicación', async () => {
    const { component, api, navegar } = await preparar();
    component.negocio = { ...datos };
    api.crearEmprendimiento.mockRejectedValue(new Error('No se pudo publicar'));
    await component.guardar();
    expect(component.mensaje).toBe('No se pudo publicar');
    expect(component.procesando).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });
});
