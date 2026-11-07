import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toRequestState } from '@app/api/request-state';
import { Player } from '@app/api/services/player';
import { StatusMessage, StatusMessageType } from '@app/shared/status-message/status-message';
import { LeaderboardsType } from '@constants/enums/leaderboards';
import { Team } from '@app/api/services/team';
import { NgClass } from '@angular/common';
import { map } from 'rxjs';

type LeaderboardPageConfig = {
  id: string;
  name: string;
  displayValue: number;
  team: string | null;
};

@Component({
  imports: [NgClass, StatusMessage],
  selector: 'app-leaderboards',
  styleUrl: './leaderboards.css',
  templateUrl: './leaderboards.html',
})
export class Leaderboards {
  public activeLeaderboardFilter = signal(LeaderboardsType.CurrentSeason);
  public leaderBoardFilters = [...Object.values(LeaderboardsType)];

  private playerService = inject(Player);
  private teamService = inject(Team);
  private playersState = toRequestState(
    this.playerService.getAllPlayers().pipe(map((p) => p.players)),
  );
  private teamsState = toRequestState(this.teamService.getAllTeams().pipe(map((t) => t.teams)));

  public playersData = computed(() => {
    const state = this.playersState();
    return state.status === 'ready' ? state.data : [];
  });
  public teamsData = computed(() => {
    const state = this.teamsState();
    return state.status === 'ready' ? state.data : [];
  });

  public leaderboardData: Signal<LeaderboardPageConfig[]> = computed(() => {
    const filter = this.activeLeaderboardFilter();
    let data: LeaderboardPageConfig[] = [];
    switch (filter) {
      case LeaderboardsType.AllTime:
        data = this.playersData().reduce((prev, curr) => {
          prev.push({
            id: curr.id,
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
            id: curr.id,
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
            id: curr.id,
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
            id: curr.id,
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

  public listStatus: Signal<StatusMessageType | null> = computed(() => {
    const state =
      this.activeLeaderboardFilter() === LeaderboardsType.Teams
        ? this.teamsState()
        : this.playersState();
    if (state.status !== 'ready') {
      return state.status;
    }
    return this.leaderboardData().length === 0 ? 'empty' : null;
  });

  public onClickFilter(filter: LeaderboardsType) {
    this.activeLeaderboardFilter.set(filter);
  }
}
