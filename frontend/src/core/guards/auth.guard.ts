import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

export const authGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated()) {
    return true;
  }

  // Chuyển hướng người dùng chưa đăng nhập về trang đăng nhập
  return router.createUrlTree(['/login']);
};
