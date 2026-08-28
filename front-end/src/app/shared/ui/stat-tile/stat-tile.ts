import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-stat-tile',
  styleUrl: './stat-tile.css',
  templateUrl: './stat-tile.html',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null>();
  readonly hint = input<string>();
}
