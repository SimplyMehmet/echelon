import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Player } from '@app/api/services/player';
import { Team } from '@app/api/services/team';

type categoryEntry = {
  displayPoints: number;
  name: string;
};

type categoryDisplay = {
  title: string;
  subTitle: string;
  entries: categoryEntry[];
};

enum LeaderboardsTypes {
  MostLoyal = 'Most loyal',
  AllTime = 'All time',
  CurrentSeason = 'Current season',
  Teams = 'Team standings',
}

type mappedCategory = Record<LeaderboardsTypes, categoryDisplay>;

@Component({
  imports: [KeyValuePipe],
  selector: 'app-leaderboards-banner',
  styleUrl: './leaderboards-banner.css',
  templateUrl: './leaderboards-banner.html',
})
export class LeaderboardsBanner {
  private teamService = inject(Team);
  private playerService = inject(Player);
  private teamsData = toSignal(this.teamService.getAllTeams(), { initialValue: null });
  private playersData = toSignal(this.playerService.getAllPlayers(), { initialValue: null });

  public categories: Signal<mappedCategory> = computed(() => {
    const teamsData = this.teamsData();
    const playersData = this.playersData();

    if (!teamsData || !playersData) {
      return {
        [LeaderboardsTypes.MostLoyal]: {
          title: LeaderboardsTypes.MostLoyal,
          subTitle: 'Top 8 - Events joined',
          entries: [],
        },
        [LeaderboardsTypes.AllTime]: {
          title: LeaderboardsTypes.AllTime,
          subTitle: 'Top 8 - All time',
          entries: [],
        },
        [LeaderboardsTypes.CurrentSeason]: {
          title: LeaderboardsTypes.CurrentSeason,
          subTitle: 'Top 8 - Current season',
          entries: [],
        },
        [LeaderboardsTypes.Teams]: {
          title: LeaderboardsTypes.Teams,
          subTitle: 'Teams standings',
          entries: [],
        },
      };
    }

    const teams = teamsData.teams.map((team) => ({
      displayPoints: team.players?.reduce((total, player) => total + player.scoreCurrent, 0) ?? 0,
      name: team.name,
    }));

    const mostLoyal = playersData.players.map((player) => ({
      name: player.name,
      displayPoints: player.attended,
    }));

    const allTime = playersData.players.map((player) => ({
      name: player.name,
      displayPoints: player.scoreTotal,
    }));

    const currentSeason = playersData.players.map((player) => ({
      name: player.name,
      displayPoints: player.scoreCurrent,
    }));

    return {
      [LeaderboardsTypes.MostLoyal]: {
        title: LeaderboardsTypes.MostLoyal,
        subTitle: 'Top 8 - Events joined',
        entries: mostLoyal.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsTypes.AllTime]: {
        title: LeaderboardsTypes.AllTime,
        subTitle: 'Top 8 - All time',
        entries: allTime.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsTypes.CurrentSeason]: {
        title: LeaderboardsTypes.CurrentSeason,
        subTitle: 'Top 8 - Current season',
        entries: currentSeason.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
      [LeaderboardsTypes.Teams]: {
        title: LeaderboardsTypes.Teams,
        subTitle: 'Teams standings',
        entries: teams.sort((a, b) => b.displayPoints - a.displayPoints).slice(0, 8),
      },
    };
  });
}
