import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ties share a rank number — season 2 has 33 players on rank 27. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-rank-badge',
  styleUrl: './rank-badge.css',
  templateUrl: './rank-badge.html',
})
export class RankBadge {
  readonly rank = input.required<number>();
  readonly tied = input(false);
}
