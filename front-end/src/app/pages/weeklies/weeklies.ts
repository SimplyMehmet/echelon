import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { NOW } from '@core/data/clock';
import { EchelonData } from '@core/data/echelon-data';
import { isUpcoming, upcomingWeeklies } from '@core/domain';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { WeeklyCard } from '@shared/ui/weekly-card/weekly-card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, ErrorState, LoadingState, WeeklyCard],
  selector: 'app-weeklies',
  styleUrl: './weeklies.css',
  templateUrl: './weeklies.html',
})
export class Weeklies {
  private readonly data = inject(EchelonData);
  /** Snapshotted, not read inside a computed: a derivation whose result
   * depends on when it happens to run is not a derivation. */
  private readonly now = inject(NOW)();

  protected readonly weeklies = resource({
    loader: () => this.data.listWeeklies(),
  });

  /**
   * Date-aware, not state-aware: start.gg event state goes stale, so filtering
   * on status alone lists months-old events as open.
   */
  protected readonly upcoming = computed(() =>
    upcomingWeeklies(this.weeklies.value() ?? [], this.now),
  );

  /** The exact complement, so no weekly falls through the gap. Newest first. */
  protected readonly past = computed(() =>
    (this.weeklies.value() ?? []).filter((weekly) => !isUpcoming(weekly, this.now)),
  );
}
