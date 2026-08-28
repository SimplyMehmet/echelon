import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { weeklyId } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';
import { RankBadge } from '@shared/ui/rank-badge/rank-badge';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, EmptyState, ErrorState, LoadingState, PlayerName, RankBadge, RouterLink],
  selector: 'app-weekly-detail',
  styleUrl: './weekly-detail.css',
  templateUrl: './weekly-detail.html',
})
export class WeeklyDetail {
  private readonly data = inject(EchelonData);

  readonly weeklyId = input.required<string>();

  protected readonly results = resource({
    params: () => ({ id: weeklyId(this.weeklyId()) }),
    loader: ({ params }) => this.data.getWeeklyResults(params.id),
  });
}
