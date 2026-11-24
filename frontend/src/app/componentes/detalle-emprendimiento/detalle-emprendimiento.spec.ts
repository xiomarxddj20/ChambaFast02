import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Articulo, ArticuloDatos, Emprendimiento, Usuario } from '../../modelos/chambafast';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { DetalleEmprendimiento } from './detalle-emprendimiento';

describe('DetalleEmprendimiento', () => {
  let fixture: ComponentFixture<DetalleEmprendimiento>;
  let component: DetalleEmprendimiento;
  const negocio: Emprendimiento = {
    id: 12, usuario_id: 7, nombre: 'Café local', categoria: 'Alimentos',
    descripcion: 'Venta de café de productores locales.', ubicacion: 'Huancayo',
    tipo: 'Productos', contacto: 'cafe@example.test', estado: 'publicado', fecha_publicacion: '',
  };
  const usuario: Usuario = {
    id: 7, nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.test',
    telefono: '999999999', rol: 'empresa', activo: true,
  };
  const producto: Articulo = {
    id: 3, emprendimiento_id: 12, nombre: 'Café', tipo: 'producto',
    descripcion: 'Café tostado en grano', precio: 'S/ 20', estado: 'publicado',
  };
  const datos: ArticuloDatos = {
    nombre: 'Café molido', tipo: 'producto', descripcion: 'Café molido artesanal', precio: 'S/ 25',
  };

  function crearApi() {
    return {
      detalleEmprendimiento: vi.fn(async (_id: number) => ({ ...negocio })),
      productosDeEmprendimiento: vi.fn(async (_id: number) => [{ ...producto }]),
      usuarioActual: vi.fn(async (): Promise<Usuario | null> => ({ ...usuario })),
      crearProducto: vi.fn(async (_id: number, articulo: ArticuloDatos): Promise<Articulo> => ({ ...producto, ...articulo })),
      editarProducto: vi.fn(async (_id: number, articulo: ArticuloDatos): Promise<Articulo> => ({ ...producto, ...articulo })),
      ocultarProducto: vi.fn(async (_id: number): Promise<Articulo> => ({ ...producto, estado: 'oculto' })),
    };
  }
  let api: ReturnType<typeof crearApi>;

  beforeEach(async () => {
    api = crearApi();
    await TestBed.configureTestingModule({
      imports: [DetalleEmprendimiento],
      providers: [provideRouter([]), { provide: ApiChambaFast, useValue: api }],
    }).compileComponents();
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot.paramMap, 'get').mockReturnValue('12');
    fixture = TestBed.createComponent(DetalleEmprendimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
    await component.cargar();
  });

  it('consulta el emprendimiento por su ID y muestra sus productos', () => {
    fixture.detectChanges();
    expect(api.detalleEmprendimiento).toHaveBeenCalledWith(12);
    expect(api.productosDeEmprendimiento).toHaveBeenCalledWith(12);
    expect(component.productos).toEqual([producto]);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Café local');
  });

  it('permite administrar al propietario y al administrador, no a otros usuarios', () => {
    expect(component.esPropietario).toBe(true);
    component.usuario = { ...usuario, id: 8 };
    expect(component.esPropietario).toBe(false);
    component.usuario = { ...usuario, rol: 'postulante' };
    expect(component.esPropietario).toBe(false);
    component.usuario = { ...usuario, id: 8, rol: 'admin' };
    expect(component.esPropietario).toBe(true);
  });

  it('registra un producto válido y cierra el formulario', async () => {
    component.nuevoArticulo();
    component.articulo = { ...datos };
    api.productosDeEmprendimiento.mockResolvedValue([{ ...producto, ...datos }]);
    await component.guardarArticulo();
    expect(api.crearProducto).toHaveBeenCalledWith(12, datos);
    expect(component.productos[0].nombre).toBe(datos.nombre);
    expect(component.mostrandoFormulario).toBe(false);
  });

  it('edita el artículo seleccionado sin crear otro', async () => {
    component.editarArticulo(producto);
    expect(component.articulo.nombre).toBe(producto.nombre);
    component.articulo = { ...datos };
    await component.guardarArticulo();
    expect(api.editarProducto).toHaveBeenCalledWith(3, datos);
    expect(api.crearProducto).not.toHaveBeenCalled();
    expect(component.editandoArticuloId).toBeNull();
  });

  it('rechaza artículos con nombre o descripción insuficientes', async () => {
    component.nuevoArticulo();
    await component.guardarArticulo();
    expect(api.crearProducto).not.toHaveBeenCalled();
    expect(component.mensaje).toBe('Completa el nombre y la descripción del artículo.');
  });

  it('impide modificar productos a un usuario que no es propietario', async () => {
    component.usuario = { ...usuario, id: 8 };
    component.articulo = { ...datos };
    await component.guardarArticulo();
    await component.ocultar(3);
    expect(api.crearProducto).not.toHaveBeenCalled();
    expect(api.editarProducto).not.toHaveBeenCalled();
    expect(api.ocultarProducto).not.toHaveBeenCalled();
  });

  it('oculta un artículo y vuelve a consultar la lista', async () => {
    api.productosDeEmprendimiento.mockResolvedValue([]);
    await component.ocultar(3);
    expect(api.ocultarProducto).toHaveBeenCalledWith(3);
    expect(component.productos).toEqual([]);
  });

  it('informa si falla el guardado de un artículo', async () => {
    component.nuevoArticulo();
    component.articulo = { ...datos };
    api.crearProducto.mockRejectedValue(new Error('Error al guardar'));
    await component.guardarArticulo();
    expect(component.mensaje).toBe('No se pudo guardar el producto o servicio.');
    expect(component.mostrandoFormulario).toBe(true);
  });
});
