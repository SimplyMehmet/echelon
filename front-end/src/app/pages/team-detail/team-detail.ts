import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EchelonData } from '@core/data/echelon-data';
import { teamId } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { PlayerName } from '@shared/ui/player-name/player-name';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, EmptyState, ErrorState, LoadingState, PlayerName, RouterLink],
  selector: 'app-team-detail',
  styleUrl: './team-detail.css',
  templateUrl: './team-detail.html',
})
export class TeamDetail {
  private readonly data = inject(EchelonData);

  readonly teamId = input.required<string>();

  protected readonly team = resource({
    params: () => ({ id: teamId(this.teamId()) }),
    loader: ({ params }) => this.data.getTeam(params.id),
  });
}
