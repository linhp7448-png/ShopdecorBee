import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

export const adminGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated() && authFacade.currentUser()?.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/login']);
};
