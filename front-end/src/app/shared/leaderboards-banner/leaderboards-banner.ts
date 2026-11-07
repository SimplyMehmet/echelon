import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { toRequestState } from '@app/api/request-state';
import { Player } from '@app/api/services/player';
import { Team } from '@app/api/services/team';
import { StatusMessage, StatusMessageType } from '@app/shared/status-message/status-message';
import { LeaderboardsType } from '@constants/enums/leaderboards';

type categoryEntry = {
  id: string;
  displayPoints: number;
  name: string;
};

type categoryDisplay = {
  title: string;
  subTitle: string;
  displayFullScreen: boolean;
  entries: categoryEntry[];
};

type mappedCategory = Record<LeaderboardsType, categoryDisplay>;

@Component({
  imports: [KeyValuePipe, NgClass, StatusMessage],
  selector: 'app-leaderboards-banner',
  styleUrl: './leaderboards-banner.css',
  templateUrl: './leaderboards-banner.html',
})
export class LeaderboardsBanner {
  public fullscreen = input(false);
  private teamService = inject(Team);
  private playerService = inject(Player);
  private teamsState = toRequestState(this.teamService.getAllTeams());
  private playersState = toRequestState(this.playerService.getAllPlayers());

  public activeCategory = signal<LeaderboardsType>(LeaderboardsType.CurrentSeason);

  // Applies to a category with no entries, so 'ready' means the list really is empty.
  public emptyStatus: Signal<StatusMessageType> = computed(() => {
    const statuses = [this.teamsState().status, this.playersState().status];
    if (statuses.includes('error')) {
      return 'error';
    }
    return statuses.includes('loading') ? 'loading' : 'empty';
  });

  public categories: Signal<mappedCategory> = computed(() => {
    const teamsState = this.teamsState();
    const playersState = this.playersState();

    if (teamsState.status !== 'ready' || playersState.status !== 'ready') {
      return {
        [LeaderboardsType.CurrentSeason]: {
          title: LeaderboardsType.CurrentSeason,
          subTitle: 'Top 8 - Current season',
          displayFullScreen: true,
          entries: [],
        },
        [LeaderboardsType.Teams]: {
          title: LeaderboardsType.Teams,
          subTitle: 'Teams standings',
          displayFullScreen: true,
          entries: [],
        },
        [LeaderboardsType.AllTime]: {
          title: LeaderboardsType.AllTime,
          subTitle: 'Top 8 - All time',
          displayFullScreen: false,
          entries: [],
        },
        [LeaderboardsType.MostLoyal]: {
          title: LeaderboardsType.MostLoyal,
          subTitle: 'Top 8 - Events joined',
          displayFullScreen: false,
          entries: [],
        },
      };
    }

    const teams = teamsState.data.teams.map((team) => ({
      id: team.id,
      displayPoints: team.score,
      name: team.name,
    }));

    const mostLoyal = playersState.data.players.map((player) => ({
      id: player.id,
      name: player.name,
      displayPoints: player.attended,
    }));

    const allTime = playersState.data.players.map((player) => ({
      id: player.id,
      name: player.name,
      displayPoints: player.scoreTotal,
    }));

    const currentSeason = playersState.data.players.map((player) => ({
      id: player.id,
      name: player.name,
      displayPoints: player.scoreCurrent,
    }));

    return {
      [LeaderboardsType.CurrentSeason]: {
        title: LeaderboardsType.CurrentSeason,
        subTitle: 'Top 8 - Current season',
        displayFullScreen: true,
        entries: currentSeason.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsType.Teams]: {
        title: LeaderboardsType.Teams,
        subTitle: 'Teams standings',
        displayFullScreen: true,
        entries: teams.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsType.AllTime]: {
        title: LeaderboardsType.AllTime,
        subTitle: 'Top 8 - All time',
        displayFullScreen: false,
        entries: allTime.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsType.MostLoyal]: {
        title: LeaderboardsType.MostLoyal,
        subTitle: 'Top 8 - Events joined',
        displayFullScreen: false,
        entries: mostLoyal.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
    };
  });
}
