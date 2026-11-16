import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empleos } from './empleos';

describe('Empleos', () => {
  let component: Empleos;
  let fixture: ComponentFixture<Empleos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Empleos],
    }).compileComponents();

    fixture = TestBed.createComponent(Empleos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
