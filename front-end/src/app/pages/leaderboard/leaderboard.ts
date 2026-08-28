import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { LeaderboardMetric, LeaderboardRow, seasonId } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';
import { RankBadge } from '@shared/ui/rank-badge/rank-badge';
import { SeasonSwitcher } from '@shared/ui/season-switcher/season-switcher';

const toMetric = (value: string | undefined): LeaderboardMetric =>
  value === 'attendance' ? 'attendance' : 'points';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyState,
    ErrorState,
    LoadingState,
    PlayerName,
    RankBadge,
    RouterLink,
    SeasonSwitcher,
  ],
  selector: 'app-leaderboard',
  styleUrl: './leaderboard.css',
  templateUrl: './leaderboard.html',
})
export class Leaderboard {
  private readonly data = inject(EchelonData);
  private readonly router = inject(Router);

  /** Bound from the path by withComponentInputBinding(). */
  readonly seasonId = input.required<string>();
  /** Bound from ?sort=. In the URL so the attendance view is a shareable link. */
  readonly sort = input<LeaderboardMetric, string | undefined>('points', { transform: toMetric });

  protected readonly seasons = resource({
    loader: () => this.data.listSeasons(),
  });

  protected readonly board = resource({
    params: () => ({ id: seasonId(this.seasonId()), metric: this.sort() }),
    loader: ({ params }) => this.data.getLeaderboard(params.id, params.metric),
  });

  protected readonly meta = resource({
    loader: () => this.data.getScoringMeta(),
  });

  protected readonly activeSeasonId = computed(() => seasonId(this.seasonId()));

  /** The product thesis in one row: highest attendance in the scene, near-invisible on start.gg. */
  protected readonly mostAttended = computed<LeaderboardRow | null>(() => {
    const rows = this.board.value()?.rows ?? [];
    return rows.reduce<LeaderboardRow | null>(
      (best, row) => (best === null || row.played > best.played ? row : best),
      null,
    );
  });

  protected readonly zeroPointCount = computed(
    () => (this.board.value()?.rows ?? []).filter((row) => row.points === 0).length,
  );

  protected sortBy(metric: LeaderboardMetric): void {
    void this.router.navigate([], {
      queryParams: { sort: metric === 'points' ? null : metric },
      queryParamsHandling: 'merge',
    });
  }

  protected ariaSort(metric: LeaderboardMetric): 'descending' | 'none' {
    return this.sort() === metric ? 'descending' : 'none';
  }
}
