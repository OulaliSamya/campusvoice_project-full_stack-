// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // ✅ N'envoie le header que si le token est un JWT valide (3 parties séparées par des points)
  if (token && token.split('.').length === 3) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
    return next(authReq);
  }

  // Sinon, continue sans auth
  return next(req);
};