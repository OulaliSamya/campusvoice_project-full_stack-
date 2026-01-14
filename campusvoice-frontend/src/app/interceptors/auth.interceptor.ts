// src/app/interceptors/auth.interceptor.ts
import { Injectable, Injector } from '@angular/core'; // ✅ Ajoute Injector
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {} // ✅ Injecte Injector, pas AuthService

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // ✅ Récupère AuthService au moment de l'interception (pas au constructeur)
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    if (token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}