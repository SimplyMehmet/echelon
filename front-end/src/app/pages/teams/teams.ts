import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { SeasonId } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';
import { RankBadge } from '@shared/ui/rank-badge/rank-badge';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, ErrorState, LoadingState, PlayerName, RankBadge, RouterLink],
  selector: 'app-teams',
  styleUrl: './teams.css',
  templateUrl: './teams.html',
})
export class Teams {
  private readonly data = inject(EchelonData);

  protected readonly seasons = resource({
    loader: () => this.data.listSeasons(),
  });

  /** Bound from ?season=. In the URL for the same reason the leaderboard's is. */
  readonly season = input<string | undefined>(undefined);

  protected readonly activeSeasonId = computed<SeasonId | null>(() => {
    const requested = this.season();
    return requested ? (requested as SeasonId) : (this.seasons.value()?.at(-1)?.id ?? null);
  });

  protected readonly standings = resource({
    params: () => ({ seasonId: this.activeSeasonId() }),
    loader: ({ params }) =>
      params.seasonId ? this.data.getTeamStandings(params.seasonId) : Promise.resolve(null),
  });
}
