import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Empleos } from './componentes/empleos/empleos';
import { Oferta } from './componentes/oferta/oferta';
import { PublicarOferta } from './componentes/publicar-oferta/publicar-oferta';
import { Emprendimientos } from './componentes/emprendimientos/emprendimientos';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Postular } from './componentes/postular/postular';
import { MisPostulaciones } from './componentes/mis-postulaciones/mis-postulaciones';
import { MisOfertas } from './componentes/mis-ofertas/mis-ofertas';
import { PostulacionesOferta } from './componentes/postulaciones-oferta/postulaciones-oferta';
import { PublicarEmprendimiento } from './componentes/publicar-emprendimiento/publicar-emprendimiento';
import { MisEmprendimientos } from './componentes/mis-emprendimientos/mis-emprendimientos';
import { DetalleEmprendimiento } from './componentes/detalle-emprendimiento/detalle-emprendimiento';
import { Administracion } from './componentes/administracion/administracion';
import { rolGuard } from './guardias/acceso.guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'empleos', component: Empleos },
  {
    path: 'empleos/:id/postular',
    component: Postular,
    canActivate: [rolGuard('postulante')],
  },
  {
    path: 'empleos/:id/postulaciones',
    component: PostulacionesOferta,
    canActivate: [rolGuard('empresa', 'admin')],
  },
  { path: 'empleos/:id', component: Oferta },
  {
    path: 'publicar-oferta',
    component: PublicarOferta,
    canActivate: [rolGuard('empresa', 'admin')],
  },
  {
    path: 'editar-oferta/:id',
    component: PublicarOferta,
    canActivate: [rolGuard('empresa', 'admin')],
  },
  {
    path: 'mis-ofertas',
    component: MisOfertas,
    canActivate: [rolGuard('empresa')],
  },
  {
    path: 'mis-postulaciones',
    component: MisPostulaciones,
    canActivate: [rolGuard('postulante')],
  },
  { path: 'emprendimientos', component: Emprendimientos },
  { path: 'emprendimientos/:id', component: DetalleEmprendimiento },
  {
    path: 'publicar-emprendimiento',
    component: PublicarEmprendimiento,
    canActivate: [rolGuard('empresa', 'admin')],
  },
  {
    path: 'editar-emprendimiento/:id',
    component: PublicarEmprendimiento,
    canActivate: [rolGuard('empresa', 'admin')],
  },
  {
    path: 'mis-emprendimientos',
    component: MisEmprendimientos,
    canActivate: [rolGuard('empresa')],
  },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  {
    path: 'administracion',
    component: Administracion,
    canActivate: [rolGuard('admin')],
  },
  { path: '**', redirectTo: '' },
];
