import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './componentes/navbar/navbar';
import { Inicio } from './componentes/inicio/inicio';
import { Footer } from './componentes/footer/footer';

@Component({
  imports: [RouterOutlet, NavbarComponent, Inicio, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('ChambaFast');
}
