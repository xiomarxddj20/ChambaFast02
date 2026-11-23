import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Registro } from './registro';
import { provideRouter } from '@angular/router';
import { ApiChambaFast } from '../../servicios/puerto-api';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra un error asíncrono y permite volver a enviar el formulario', async () => {
    fixture.destroy();
    let rechazar!: (error: Error) => void;
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([]), {
        provide: ApiChambaFast,
        useValue: { registrar: () => new Promise((_resolve, reject) => { rechazar = reject; }) },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(Registro);
    await fixture.whenStable();
    const valores: Record<string, string> = {
      nombre: 'Ana', apellido: 'Perez', correo: 'ana@example.com',
      telefono: '999999999', tipoUsuario: 'postulante',
      contrasena: 'ClaveSegura123', confirmarContrasena: 'ClaveSegura123',
    };
    for (const [id, valor] of Object.entries(valores)) {
      const campo = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
      campo.value = valor;
      campo.dispatchEvent(new Event(id === 'tipoUsuario' ? 'change' : 'input', { bubbles: true }));
    }
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);

    rechazar(new Error('Este correo ya está registrado'));
    await Promise.resolve();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.mensaje')?.textContent)
      .toContain('Este correo ya está registrado');
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });
});
