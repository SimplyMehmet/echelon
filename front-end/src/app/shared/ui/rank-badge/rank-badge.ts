import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Ties share a rank number and are shown as exactly that: two players on 4 both
 * read "4". No "T-4" prefix — the repeated number is the tie, and prefixing it
 * makes the column harder to scan for the sake of restating what is visible.
 * `tied` survives as a hover/assistive-tech title only.
 */
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
