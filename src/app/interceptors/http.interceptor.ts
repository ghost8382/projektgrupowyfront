import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.body !== null && req.body !== undefined) {
    const cloned = req.clone({
      setHeaders: { 'Content-Type': 'application/json' }
    });
    return next(cloned);
  }
  return next(req);
};
