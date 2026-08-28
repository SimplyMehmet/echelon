import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { DatePipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { playerId } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, EmptyState, ErrorState, LoadingState, PercentPipe, RouterLink, StatTile],
  selector: 'app-player-profile',
  styleUrl: './player-profile.css',
  templateUrl: './player-profile.html',
})
export class PlayerProfilePage {
  private readonly data = inject(EchelonData);

  readonly playerId = input.required<string>();

  protected readonly player = resource({
    params: () => ({ id: playerId(this.playerId()) }),
    loader: ({ params }) => this.data.getPlayer(params.id),
  });

  protected readonly profile = resource({
    params: () => ({ id: playerId(this.playerId()) }),
    loader: ({ params }) => this.data.getPlayerProfile(params.id),
  });

  /** Null for all but the tracked regulars — the common case, not an error. */
  protected readonly stats = resource({
    params: () => ({ id: playerId(this.playerId()) }),
    loader: ({ params }) => this.data.getPlayerStats(params.id),
  });
}
