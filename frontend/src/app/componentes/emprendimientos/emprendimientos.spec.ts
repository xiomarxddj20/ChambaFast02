import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmprendimientosComponent } from './emprendimientos';

describe('Emprendimientos', () => {
  let component: EmprendimientosComponent;
  let fixture: ComponentFixture<EmprendimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmprendimientosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmprendimientosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
