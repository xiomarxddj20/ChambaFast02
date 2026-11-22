import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfertasService, OfertaLaboral } from '../../servicios/ofertas.service';

@Component({
  selector: 'app-empleos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empleos.html',
  styleUrl: './empleos.css'
})
export class Empleos {

  ofertasPublicadas: OfertaLaboral[] = [];

  constructor(private ofertasService: OfertasService) {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.ofertasPublicadas = this.ofertasService.obtenerOfertas();
  }
}
