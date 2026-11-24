import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL, ApiHttpChambaFast } from './http-api.service';

describe('Conexión HTTP con FastAPI', () => {
  let api: ApiHttpChambaFast;
  let http: HttpTestingController;
  const usuario = {
    id: 7, nombre: 'Ana', apellido: 'Perez', correo: 'ana@example.com',
    telefono: '999999999', rol: 'empresa', activo: true,
  };
  const respuesta = {
    access_token: 'token_prueba', token_type: 'bearer', expires_in: 3600, usuario,
  };

  beforeEach(() => {
    sessionStorage.removeItem('chambafast_access_token');
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(), ApiHttpChambaFast,
      { provide: API_URL, useValue: 'http://api.test/' },
    ] });
    api = TestBed.inject(ApiHttpChambaFast);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('chambafast_access_token');
  });

  async function login() {
    const pendiente = api.login('ana@example.com', 'Clave12345');
    const request = http.expectOne('http://api.test/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ correo: 'ana@example.com', contrasena: 'Clave12345' });
    request.flush(respuesta);
    await pendiente;
  }

  it('conserva el token y consulta el usuario con Bearer', async () => {
    await login();
    expect(sessionStorage.getItem('chambafast_access_token')).toBe('token_prueba');
    const pendiente = api.usuarioActual();
    const request = http.expectOne('http://api.test/auth/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token_prueba');
    expect(request.request.transferCache).toBe(false);
    request.flush(usuario);
    expect(await pendiente).toEqual(usuario);
  });

  it('recupera la sesión al crear de nuevo el adaptador', async () => {
    await login();
    const nuevo = TestBed.runInInjectionContext(() => new ApiHttpChambaFast());
    const pendiente = nuevo.usuarioActual();
    const request = http.expectOne('http://api.test/auth/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token_prueba');
    request.flush(usuario);
    expect(await pendiente).toEqual(usuario);
  });

  it('no hace solicitudes de sesión si no existe token', async () => {
    expect(await api.usuarioActual()).toBeNull();
    http.expectNone('http://api.test/auth/me');
  });

  it('elimina la sesión cuando FastAPI devuelve 401', async () => {
    await login();
    const pendiente = api.usuarioActual();
    http.expectOne('http://api.test/auth/me').flush({ detail: 'Token expirado' }, {
      status: 401, statusText: 'Unauthorized',
    });
    expect(await pendiente).toBeNull();
    expect(sessionStorage.getItem('chambafast_access_token')).toBeNull();
  });

  it('no elimina la sesión por una caída del servidor', async () => {
    await login();
    const pendiente = api.usuarioActual();
    http.expectOne('http://api.test/auth/me').flush({ detail: 'No disponible' }, {
      status: 503, statusText: 'Service Unavailable',
    });
    await expect(pendiente).rejects.toThrow('No disponible');
    expect(sessionStorage.getItem('chambafast_access_token')).toBe('token_prueba');
  });

  it('cierra la sesión sin añadir un endpoint al backend', async () => {
    await login();
    await api.cerrarSesion();
    expect(await api.usuarioActual()).toBeNull();
    expect(sessionStorage.getItem('chambafast_access_token')).toBeNull();
  });

  it('registra cuentas usando el contrato existente', async () => {
    const datos = {
      nombre: 'Ana', apellido: 'Perez', correo: 'ana@example.com', telefono: '999999999',
      rol: 'empresa' as const, contrasena: 'Clave12345',
    };
    const pendiente = api.registrar(datos);
    const request = http.expectOne('http://api.test/auth/registro');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(datos);
    request.flush(respuesta);
    expect(await pendiente).toEqual(respuesta);
    expect(sessionStorage.getItem('chambafast_access_token')).toBe('token_prueba');
  });

  it('envía filtros como parámetros, no concatenados a la URL', async () => {
    const pendiente = api.listarOfertas('Tecnología');
    const request = http.expectOne(req => req.url === 'http://api.test/ofertas');
    expect(request.request.params.get('categoria')).toBe('Tecnología');
    request.flush([]);
    expect(await pendiente).toEqual([]);
  });

  const oferta = {
    cargo: 'Vendedor', empresa: 'Empresa', categoria: 'Ventas' as const,
    descripcion: 'Venta de productos', requisitos: 'Experiencia en ventas',
    ubicacion: 'Lima', modalidad: 'Presencial' as const, salario: '',
  };
  const negocio = {
    nombre: 'Negocio', categoria: 'Alimentos' as const, descripcion: 'Venta de alimentos',
    ubicacion: 'Lima', tipo: 'Productos' as const, contacto: '999999999',
  };
  const articulo = { nombre: 'Producto', tipo: 'producto' as const, descripcion: 'Producto local', precio: '' };
  const rutas: [string, string, (api: ApiHttpChambaFast) => Promise<unknown>, unknown?][] = [
    ['GET', '/ofertas', api => api.listarOfertas()],
    ['GET', '/ofertas/42', api => api.detalleOferta(42)],
    ['POST', '/ofertas', api => api.crearOferta(oferta), oferta],
    ['PUT', '/ofertas/42', api => api.actualizarOferta(42, oferta), oferta],
    ['PATCH', '/ofertas/42/cerrar', api => api.cerrarOferta(42)],
    ['PATCH', '/ofertas/42/reabrir', api => api.reabrirOferta(42)],
    ['GET', '/mis-ofertas', api => api.misOfertas()],
    ['POST', '/ofertas/42/postulaciones', api => api.postular(42, 'Mensaje'), { mensaje: 'Mensaje' }],
    ['GET', '/mis-postulaciones', api => api.misPostulaciones()],
    ['GET', '/ofertas/42/postulaciones', api => api.postulacionesDeOferta(42)],
    ['PATCH', '/postulaciones/8/estado', api => api.cambiarEstadoPostulacion(8, 'aceptada'), { estado: 'aceptada' }],
    ['GET', '/emprendimientos', api => api.listarEmprendimientos()],
    ['GET', '/emprendimientos/3', api => api.detalleEmprendimiento(3)],
    ['POST', '/emprendimientos', api => api.crearEmprendimiento(negocio), negocio],
    ['PUT', '/emprendimientos/3', api => api.actualizarEmprendimiento(3, negocio), negocio],
    ['GET', '/mis-emprendimientos', api => api.misEmprendimientos()],
    ['PATCH', '/emprendimientos/3/ocultar', api => api.ocultarEmprendimiento(3)],
    ['PATCH', '/emprendimientos/3/reactivar', api => api.reactivarEmprendimiento(3)],
    ['GET', '/emprendimientos/3/productos', api => api.productosDeEmprendimiento(3)],
    ['POST', '/emprendimientos/3/productos', api => api.crearProducto(3, articulo), articulo],
    ['PUT', '/productos/9', api => api.editarProducto(9, articulo), articulo],
    ['PATCH', '/productos/9/ocultar', api => api.ocultarProducto(9)],
    ['GET', '/admin/usuarios', api => api.listarUsuarios()],
    ['PATCH', '/admin/usuarios/7/estado', api => api.cambiarEstadoUsuario(7, false), { activo: false }],
  ];
  for (const [metodo, ruta, llamar, body] of rutas) {
    it(`conecta ${metodo} ${ruta}`, async () => {
      const pendiente = llamar(api);
      const request = http.expectOne(`http://api.test${ruta}`);
      expect(request.request.method).toBe(metodo);
      expect(request.request.body).toEqual(body ?? null);
      request.flush({});
      await pendiente;
    });
  }

  it('propaga los mensajes de FastAPI sin cambiar las reglas', async () => {
    const pendiente = api.detalleOferta(42);
    http.expectOne('http://api.test/ofertas/42').flush({ detail: 'Oferta no encontrada' }, {
      status: 404, statusText: 'Not Found',
    });
    await expect(pendiente).rejects.toThrow('Oferta no encontrada');
  });
});
