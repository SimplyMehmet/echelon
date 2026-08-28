import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { EchelonData } from '@core/data/echelon-data';
import { PlayerId, TeamId } from '@core/domain';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerPicker } from '@shared/ui/player-picker/player-picker';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorState, LoadingState, PlayerPicker],
  selector: 'app-admin-teams',
  styleUrl: './admin-teams.css',
  templateUrl: './admin-teams.html',
})
export class AdminTeams {
  private readonly data = inject(EchelonData);

  protected readonly teams = resource({
    loader: () => this.data.listTeams(),
  });

  protected readonly players = resource({
    loader: () => this.data.searchPlayers(),
  });

  protected readonly selectedTeam = signal<TeamId | null>(null);
  protected readonly note = signal<string | null>(null);

  protected async add(playerId: PlayerId): Promise<void> {
    const team = this.selectedTeam();
    if (!team) {
      this.note.set('Pick a team first.');
      return;
    }
    await this.data.addTeamMember(team, playerId, new Date().toISOString());
    this.note.set('Added. Team standings recompute from the join date onwards.');
  }

  protected chooseTeam(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTeam.set(value ? (value as TeamId) : null);
  }
}
