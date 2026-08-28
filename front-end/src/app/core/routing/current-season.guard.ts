import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';

/**
 * A guard rather than `redirectTo`, because a functional redirect must return
 * synchronously and "which season is current" comes from an async fetch.
 *
 * Result: one canonical URL per season, and no season hidden in app state.
 */
export const currentSeasonRedirectGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const seasons = await inject(EchelonData).listSeasons();
  const current = seasons.at(-1);
  return current
    ? router.createUrlTree(['/leaderboard', current.id])
    : router.createUrlTree(['/weeklies']);
};
