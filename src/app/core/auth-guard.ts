import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../core/supabase';

export const authGuard: CanActivateFn = async() => {
  const supa = inject(SupabaseService);
  const router = inject(Router);

  const session = await supa.getCurrentSession();
  if (session) return true;

  router.navigateByUrl('/');
  return false;
};
