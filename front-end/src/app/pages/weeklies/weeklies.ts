import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { EchelonData } from '@core/data/echelon-data';
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

  protected readonly weeklies = resource({
    loader: () => this.data.listWeeklies(),
  });

  /** Status comes from the event's own state, not from the clock. */
  protected readonly open = computed(() =>
    (this.weeklies.value() ?? []).filter((w) => w.status !== 'completed'),
  );

  protected readonly past = computed(() =>
    (this.weeklies.value() ?? []).filter((w) => w.status === 'completed'),
  );
}
