import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Skeleton rows sized to the expected count, not a spinner — leaderboards run
 * 22 to 69 rows and a spinner guarantees layout shift on every navigation.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-loading-state',
  styleUrl: './loading-state.css',
  templateUrl: './loading-state.html',
})
export class LoadingState {
  readonly rows = input(6);
  readonly label = input('Loading');

  protected readonly placeholders = computed(() =>
    Array.from({ length: this.rows() }, (_, i) => i),
  );
}
