import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OfertasService } from '../../servicios/ofertas.service';

@Component({
  selector: 'app-publicar-oferta',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './publicar-oferta.html',
  styleUrl: './publicar-oferta.css'
})
export class PublicarOferta {

  oferta = {
    cargo: '',
    empresa: '',
    categoria: '',
    descripcion: '',
    requisitos: '',
    ubicacion: '',
    modalidad: '',
    salario: ''
  };

  constructor(
    private ofertasService: OfertasService,
    private router: Router
  ) {}

  publicar(): void {
    const nuevaOferta = {
      ...this.oferta,
      id: Date.now()
    };

    this.ofertasService.publicarOferta(nuevaOferta);

    alert('¡Tu oferta laboral se publicó correctamente!');

    this.router.navigate(['/empleos']);
  }
}
