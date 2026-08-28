import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PlayerId, PlayerSearchHit } from '@core/domain';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-player-picker',
  styleUrl: './player-picker.css',
  templateUrl: './player-picker.html',
})
export class PlayerPicker {
  readonly hits = input.required<readonly PlayerSearchHit[]>();
  readonly label = input('Player');
  /** 'walk-in' narrows to the 21 unlinked players — the merge screen's left side. */
  readonly origin = input<'startgg' | 'walk-in' | null>(null);
  readonly selected = output<PlayerId>();

  protected readonly query = signal('');

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const origin = this.origin();
    return this.hits()
      .filter((hit) => (origin ? hit.player.origin === origin : true))
      .filter((hit) =>
        needle
          ? hit.player.gamertag.toLowerCase().includes(needle) ||
            hit.player.aliases.some((a) => a.toLowerCase().includes(needle))
          : true,
      )
      .slice(0, 12);
  });

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
