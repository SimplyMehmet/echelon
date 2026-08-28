import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Player, PlayerRef } from '@core/domain';

/**
 * The single place that knows how a player is displayed.
 *
 * Two domain rules live here so no template ever re-implements them: a walk-in
 * has no start.gg profile to link to, and a gamertag is never an identity —
 * links always go to the player id.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-player-name',
  styleUrl: './player-name.css',
  templateUrl: './player-name.html',
})
export class PlayerName {
  readonly player = input.required<PlayerRef | Player>();
  readonly showFormerTags = input(false);

  protected readonly formerTags = computed(() => {
    const player = this.player();
    return 'aliases' in player ? player.aliases : [];
  });
}
