import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';
import { RankBadge } from '@shared/ui/rank-badge/rank-badge';
import { WeeklyCard } from '@shared/ui/weekly-card/weekly-card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, ErrorState, LoadingState, PlayerName, RankBadge, RouterLink, WeeklyCard],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly data = inject(EchelonData);

  /**
   * One call, not four. The landing page is exactly the kind of view a backend
   * serves pre-assembled, so the seam exposes it that way and the page gets a
   * single loading, error and retry path.
   */
  protected readonly summary = resource({
    loader: () => this.data.getHomeSummary(),
  });
}
