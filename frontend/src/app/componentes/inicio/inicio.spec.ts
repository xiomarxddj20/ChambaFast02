import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inicio } from './inicio';
import { provideRouter } from '@angular/router';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Inicio);
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
      ['/empleos', 'Ver empleos'],
      ['/emprendimientos', 'Ver emprendimientos'],
      ['/publicar-oferta', 'Publicar oportunidades'],
      ['/registro', 'Comenzar ahora'],
    ];
    for (const [ruta, texto] of esperados) {
      const enlace = enlaces.find(a => a.textContent?.trim().startsWith(texto));
      expect(enlace?.getAttribute('href')).toBe(ruta);
    }
  });
});
