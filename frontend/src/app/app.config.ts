import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { ApiChambaFast } from './servicios/puerto-api';
import { ApiDemoChambaFast } from './servicios/demo-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    { provide: ApiChambaFast, useClass: ApiDemoChambaFast },
  ],
};
