import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol, Usuario } from '../modelos/chambafast';
import { ApiChambaFast } from '../servicios/puerto-api';

function panelDe(rol: Rol): string {
  if (rol === 'empresa') return '/mis-ofertas';
  if (rol === 'admin') return '/administracion';
  return '/mis-postulaciones';
}

export const sesionGuard: CanActivateFn = async (_ruta, estado) => {
  const router = inject(Router);
  const api = inject(ApiChambaFast);
  let usuario: Usuario | null;
  try { usuario = await api.usuarioActual(); }
  catch { return false; } // Cancelar navegación, no confundir un fallo de red con logout.
  if (usuario) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { destino: estado.url },
  });
};

export function rolGuard(...roles: Rol[]): CanActivateFn {
  return async (_ruta, estado) => {
    const router = inject(Router);
    const api = inject(ApiChambaFast);
    let usuario: Usuario | null;
    try { usuario = await api.usuarioActual(); }
    catch { return false; }

    if (!usuario) {
      return router.createUrlTree(['/login'], {
        queryParams: { destino: estado.url },
      });
    }
    if (roles.includes(usuario.rol)) return true;

    return router.createUrlTree([panelDe(usuario.rol)]);
  };
}
