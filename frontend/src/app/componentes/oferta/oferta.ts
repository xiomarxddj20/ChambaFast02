import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-oferta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './oferta.html',
  styleUrl: './oferta.css'
})
export class Oferta {

  idOferta: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.idOferta = this.route.snapshot.paramMap.get('id');
  }

}