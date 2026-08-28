import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Player, PlayerRef } from '@core/domain';

/**
 * The single place that knows how a player is displayed.
 *
 * Always the current gamertag, never a former one — a player is whoever they
 * are now. Identity is still the player id, never the tag: Metabyte was once
 * "Probase" while a different human is "Probaze", so the link below goes to the
 * id and the two never collide.
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
}
