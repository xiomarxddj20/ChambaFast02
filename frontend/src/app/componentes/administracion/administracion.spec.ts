import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Usuario } from '../../modelos/chambafast';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Administracion } from './administracion';

describe('Administracion', () => {
  let fixture: ComponentFixture<Administracion>;
  let component: Administracion;
  const usuario: Usuario = {
    id: 7, nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.test',
    telefono: '999999999', rol: 'empresa', activo: true,
  };
  let listarUsuarios: ReturnType<typeof vi.fn<() => Promise<Usuario[]>>>;
  let cambiarEstado: ReturnType<typeof vi.fn<(id: number, activo: boolean) => Promise<Usuario>>>;

  beforeEach(async () => {
    listarUsuarios = vi.fn(async () => [{ ...usuario }]);
    cambiarEstado = vi.fn(async (_id: number, activo: boolean) => ({ ...usuario, activo }));
    await TestBed.configureTestingModule({
      imports: [Administracion],
      providers: [{ provide: ApiChambaFast, useValue: {
        listarUsuarios, cambiarEstadoUsuario: cambiarEstado,
      } }],
    }).compileComponents();
    fixture = TestBed.createComponent(Administracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('carga y muestra los usuarios registrados', async () => {
    await component.cargar();
    fixture.detectChanges();
    expect(listarUsuarios).toHaveBeenCalled();
    expect(component.usuarios).toEqual([usuario]);
    expect(fixture.nativeElement.querySelector('article')?.textContent).toContain('Ana Pérez');
  });

  it('desactiva una cuenta activa y actualiza la lista', async () => {
    listarUsuarios.mockResolvedValue([{ ...usuario, activo: false }]);
    await component.cambiarEstado(usuario);
    expect(cambiarEstado).toHaveBeenCalledWith(7, false);
    expect(component.usuarios[0].activo).toBe(false);
  });

  it('reactiva una cuenta desactivada', async () => {
    await component.cambiarEstado({ ...usuario, activo: false });
    expect(cambiarEstado).toHaveBeenCalledWith(7, true);
    expect(component.usuarios[0].activo).toBe(true);
  });

  it('informa si no se pueden consultar los usuarios', async () => {
    listarUsuarios.mockRejectedValue(new Error('Error de consulta'));
    await component.cargar();
    expect(component.mensaje).toBe('No se pudo acceder a los usuarios.');
  });

  it('informa si falla el cambio de estado', async () => {
    cambiarEstado.mockRejectedValue(new Error('Error de actualización'));
    await component.cambiarEstado(usuario);
    expect(component.mensaje).toBe('No se pudo actualizar la cuenta.');
  });
});
