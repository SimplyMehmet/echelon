import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Player } from '@app/api/services/player';
import { LeaderboardsType } from '@constants/enums/leaderboards';
import { Team } from '@app/api/services/team';
import { NgClass } from '@angular/common';
import { map } from 'rxjs';

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
  public playersData = toSignal(this.playerService.getAllPlayers().pipe(map((p) => p.players)), {
    initialValue: [],
  });
  public teamsData = toSignal(this.teamService.getAllTeams().pipe(map((t) => t.teams)), {
    initialValue: [],
  });

  public leaderboardData: Signal<LeaderboardPageConfig[]> = computed(() => {
    const filter = this.activeLeaderboardFilter();
    let data: LeaderboardPageConfig[] = [];
    switch (filter) {
      case LeaderboardsType.AllTime:
        data = this.playersData().reduce((prev, curr) => {
          prev.push({
            displayValue: curr.scoreTotal,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.CurrentSeason:
        data = this.playersData().reduce((prev, curr) => {
          prev.push({
            displayValue: curr.scoreCurrent,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.MostLoyal:
        data = this.playersData().reduce((prev, curr) => {
          prev.push({
            displayValue: curr.attended,
            name: curr.name,
            team: curr.team,
          });
          return prev;
        }, [] as LeaderboardPageConfig[]);
        break;
      case LeaderboardsType.Teams:
        data = this.teamsData().reduce((prev, curr) => {
          prev.push({
            displayValue: curr.score,
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
