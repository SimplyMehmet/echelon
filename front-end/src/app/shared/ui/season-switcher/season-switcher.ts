import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Season, SeasonId } from '@core/domain';

/** Navigates rather than emitting — the URL is the state. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-season-switcher',
  styleUrl: './season-switcher.css',
  templateUrl: './season-switcher.html',
})
export class SeasonSwitcher {
  readonly seasons = input.required<readonly Season[]>();
  readonly activeSeasonId = input<SeasonId | null>(null);
  readonly basePath = input<string>('/leaderboard');
}
