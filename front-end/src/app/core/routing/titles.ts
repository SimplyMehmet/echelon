import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { playerId, seasonId, teamId, weeklyId } from '@core/domain';

/** Resolvers are for titles only. Page data is fetched with resource() in the container. */

export const seasonTitle: ResolveFn<string> = async (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('seasonId');
  const season = id ? await inject(EchelonData).getSeason(seasonId(id)) : null;
  return season ? `${season.name} leaderboard` : 'Leaderboard';
};

export const playerTitle: ResolveFn<string> = async (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('playerId');
  const player = id ? await inject(EchelonData).getPlayer(playerId(id)) : null;
  return player?.gamertag ?? 'Player';
};

export const weeklyTitle: ResolveFn<string> = async (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('weeklyId');
  const weekly = id ? await inject(EchelonData).getWeekly(weeklyId(id)) : null;
  return weekly?.name ?? 'Weekly';
};

export const teamTitle: ResolveFn<string> = async (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('teamId');
  const team = id ? await inject(EchelonData).getTeam(teamId(id)) : null;
  return team?.team.name ?? 'Team';
};
