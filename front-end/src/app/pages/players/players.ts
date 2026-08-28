import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { EchelonData } from '@core/data/echelon-data';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorState, LoadingState, PlayerName],
  selector: 'app-players',
  styleUrl: './players.css',
  templateUrl: './players.html',
})
export class Players {
  private readonly data = inject(EchelonData);

  protected readonly query = signal('');

  protected readonly hits = resource({
    params: () => ({ query: this.query() }),
    loader: ({ params }) => this.data.searchPlayers(params.query),
  });

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
