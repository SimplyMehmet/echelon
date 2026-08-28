import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { EchelonData } from '@core/data/echelon-data';
import { PlayerId } from '@core/domain';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerPicker } from '@shared/ui/player-picker/player-picker';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorState, LoadingState, PlayerPicker],
  selector: 'app-admin-merge',
  styleUrl: './admin-merge.css',
  templateUrl: './admin-merge.html',
})
export class AdminMerge {
  private readonly data = inject(EchelonData);

  protected readonly players = resource({
    loader: () => this.data.searchPlayers(),
  });

  protected readonly absorb = signal<PlayerId | null>(null);
  protected readonly keep = signal<PlayerId | null>(null);
  protected readonly note = signal<string | null>(null);

  protected async merge(): Promise<void> {
    const absorb = this.absorb();
    const keep = this.keep();
    if (!absorb || !keep) {
      this.note.set('Pick both a walk-in record and the account to merge it into.');
      return;
    }
    await this.data.mergePlayers(keep, absorb);
    this.players.reload();
    this.note.set('Merged. The walk-in tag is now an alias of the linked account.');
  }
}
