// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations'; // optionnel

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // ⚠️ Pas besoin de importProvidersFrom(FormsModule, CommonModule)
    // car tu utilises des composants STANDALONE → tu importes FormsModule/CommonModule directement dans chaque composant
  ]
};