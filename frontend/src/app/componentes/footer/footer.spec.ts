import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { provideRouter } from '@angular/router';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('enlaza a las rutas de la aplicación', () => {
    const enlaces = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'));
    const esperados = [
      ['/', 'Inicio'],
      ['/empleos', 'Empleos'],
      ['/emprendimientos', 'Emprendimientos'],
      ['/login', 'Iniciar sesión'],
      ['/registro', 'Crear cuenta'],
      ['/publicar-emprendimiento', 'Publicar negocio'],
    ];
    for (const [ruta, texto] of esperados) {
      const enlace = enlaces.find(a => a.textContent?.trim().startsWith(texto));
      expect(enlace?.getAttribute('href')).toBe(ruta);
    }
  });
});
