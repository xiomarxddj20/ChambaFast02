import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Empleos} from './componentes/empleos/empleos';
import { Oferta } from './componentes/oferta/oferta';
import { PublicarOferta} from './componentes/publicar-oferta/publicar-oferta';
import { Emprendimientos} from './componentes/emprendimientos/emprendimientos';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'empleos', component: Empleos },
  { path: 'empleos/:id', component: Oferta },
  { path: 'publicar-oferta', component: PublicarOferta },
  { path: 'emprendimientos', component: Emprendimientos},
  { path: 'login', component: Login},
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: '' },
];
