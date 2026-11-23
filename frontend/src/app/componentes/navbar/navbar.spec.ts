import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';
import { Usuario } from '../../modelos/chambafast';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Estabilidad de la sesión en la barra', () => {
  let fixture: ComponentFixture<Navbar>;
  let consultas: { resolver: (usuario: Usuario | null) => void; rechazar: (error: Error) => void }[];
  const usuario: Usuario = { id: 7, nombre: 'Ana', apellido: 'Perez',
    correo: 'ana@example.com', telefono: '999999999', rol: 'empresa', activo: true };

  beforeEach(async () => {
    consultas = [];
    await TestBed.configureTestingModule({ imports: [Navbar], providers: [provideRouter([]),
      { provide: ApiChambaFast, useValue: {
        usuarioActual: () => new Promise<Usuario | null>((resolver, rechazar) => {
          consultas.push({ resolver, rechazar });
        }),
      } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
  });

  async function responder(indice: number, valor: Usuario | null) {
    consultas[indice].resolver(valor);
    await Promise.resolve();
    await fixture.whenStable();
  }

  it('muestra Mi panel al llegar la sesión sin necesitar otro clic', async () => {
    await responder(0, usuario);
    expect(fixture.nativeElement.textContent).toContain('Mi panel');
    expect(fixture.nativeElement.textContent).not.toContain('Iniciar sesión');
  });

  it('no aparenta cerrar sesión por un error transitorio de red', async () => {
    await responder(0, usuario);
    const pendiente = fixture.componentInstance.actualizarUsuario();
    consultas[1].rechazar(new Error('Servidor no disponible'));
    await pendiente;
    await fixture.whenStable();
    expect(fixture.componentInstance.usuario).toEqual(usuario);
    expect(fixture.nativeElement.textContent).toContain('Mi panel');
  });

  it('ignora una respuesta antigua que dice que no había sesión', async () => {
    const pendiente = fixture.componentInstance.actualizarUsuario();
    await responder(1, usuario);
    await pendiente;
    await responder(0, null);
    expect(fixture.componentInstance.usuario).toEqual(usuario);
  });

  it('muestra Iniciar sesión si el backend confirma que ya no hay sesión', async () => {
    await responder(0, usuario);
    const pendiente = fixture.componentInstance.actualizarUsuario();
    await responder(1, null);
    await pendiente;
    expect(fixture.nativeElement.textContent).toContain('Iniciar sesión');
    expect(fixture.nativeElement.textContent).not.toContain('Mi panel');
  });
});
