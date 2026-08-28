import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { NOW } from '@core/data/clock';
import { EchelonData } from '@core/data/echelon-data';
import { isUpcoming } from '@core/domain';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { WeeklyCard } from '@shared/ui/weekly-card/weekly-card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorState, LoadingState, WeeklyCard],
  selector: 'app-weeklies',
  styleUrl: './weeklies.css',
  templateUrl: './weeklies.html',
})
export class Weeklies {
  private readonly data = inject(EchelonData);
  private readonly now = inject(NOW);

  protected readonly weeklies = resource({
    loader: () => this.data.listWeeklies(),
  });

  /**
   * Date-aware, not state-aware: start.gg event state goes stale, so filtering
   * on status alone lists months-old events as open.
   */
  protected readonly open = computed(() => {
    const now = this.now();
    return (this.weeklies.value() ?? []).filter((w) => isUpcoming(w, now)).reverse();
  });

  protected readonly past = computed(() => {
    const now = this.now();
    return (this.weeklies.value() ?? []).filter((w) => !isUpcoming(w, now));
  });
}
