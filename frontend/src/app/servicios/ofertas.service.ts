import { Injectable } from '@angular/core';

export interface OfertaLaboral {
    id: number;
    cargo: string;
    empresa: string;
    categoria: string;
    descripcion: string;
    requisitos: string;
    ubicacion: string;
    modalidad: string;
    salario: string;
}

@Injectable({
    providedIn: 'root'
})
export class OfertasService {

    private readonly clave = 'chambafast_ofertas';

    obtenerOfertas(): OfertaLaboral[] {
        if (typeof localStorage === 'undefined') {
            return [];
        }
        const datos = localStorage.getItem(this.clave);
        try {
            return datos ? JSON.parse(datos) as OfertaLaboral[] : [];
        } catch {
            return [];
        }
    }
    publicarOferta(oferta: OfertaLaboral): void {
        const ofertas = this.obtenerOfertas();

        ofertas.unshift(oferta);

        localStorage.setItem(
            this.clave,
            JSON.stringify(ofertas)
        );
    }
}

