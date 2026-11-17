import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { EmpleosComponent } from './componentes/empleos/empleos';
import { Oferta } from './componentes/oferta/oferta';
import { PublicarOfertaComponent } from './componentes/publicar-oferta/publicar-oferta';
import { EmprendimientosComponent } from './componentes/emprendimientos/emprendimientos';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'empleos', component: EmpleosComponent },
  { path: 'empleos/:id', component: Oferta },
  { path: 'publicar-oferta', component: PublicarOfertaComponent },
  { path: 'emprendimientos', component: EmprendimientosComponent},
  { path: '**', redirectTo: '' },
];
//import { EmprendimientosComponent } from './componentes/emprendimientos/emprendimientos';
//import { ImpactoSocialComponent } from './componentes/impacto-social/impacto-social';
//import { LoginComponent } from './componentes/login/login';
//import { RegistroComponent } from './componentes/registro/registro';

/*{
    path: 'emprendimientos',
    component: EmprendimientosComponent
  },

  {
    path: 'impacto-social',
    component: ImpactoSocialComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'registro',
    component: RegistroComponent
  },

  {
    path: '**',
    redirectTo: ''
  }
*/
