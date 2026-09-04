import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerResponse } from '@app/api/responses/player';
import { Player } from '@app/api/services/player';
import { LeaderboardsType } from '@constants/enums/leaderboards';
import { Team } from '@app/api/services/team';
import { TeamResponse } from '@app/api/responses/team';
import { NgClass } from '@angular/common';

type LeaderboardPageConfig = {
  name: string;
  displayValue: number;
  team: string | null;
};

@Component({
  imports: [NgClass],
  selector: 'app-leaderboards',
  styleUrl: './leaderboards.css',
  templateUrl: './leaderboards.html',
})
export class Leaderboards {
  public activeLeaderboardFilter = signal(LeaderboardsType.CurrentSeason);
  public leaderBoardFilters = [...Object.values(LeaderboardsType)];

  private playerService = inject(Player);
  private teamService = inject(Team);
  private playersData = toSignal(this.playerService.getAllPlayers(), {
    initialValue: { players: [] },
  });
  private teamsData = toSignal(this.teamService.getAllTeams(), { initialValue: { teams: [] } });

  public players: Signal<PlayerResponse[]> = computed(() => {
    const data = this.playersData();
    if (!data.players.length) {
      return [];
    }

    return data.players;
  });

  public teams: Signal<TeamResponse[]> = computed(() => {
    const data = this.teamsData();
    if (!data.teams.length) {
      return [];
    }

    return data.teams;
  });

  public leaderboardData: Signal<LeaderboardPageConfig[]> = computed(() => {
    const filter = this.activeLeaderboardFilter();
    let data: LeaderboardPageConfig[] = [];
    switch (filter) {
      case LeaderboardsType.AllTime:
        data = this.playersData().players.reduce((prev, curr) => {
          prev.push({
            displayValue: curr.scoreTotal,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.CurrentSeason:
        data = this.playersData().players.reduce((prev, curr) => {
          prev.push({
            displayValue: curr.scoreCurrent,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.MostLoyal:
        data = this.playersData().players.reduce((prev, curr) => {
          prev.push({
            displayValue: curr.attended,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.Teams:
        data = this.teamsData().teams.reduce((prev, curr) => {
          prev.push({
            displayValue: curr.players.reduce((prev, curr) => {
              prev += curr.scoreCurrent;
              return prev;
            }, 0),
            name: curr.name,
            team: null,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
    }

    return data.sort((a, b) => b.displayValue - a.displayValue);
  });

  public onClickFilter(filter: LeaderboardsType) {
    this.activeLeaderboardFilter.set(filter);
  }
}
