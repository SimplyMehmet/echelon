import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-empty-state',
  styleUrl: './empty-state.css',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string>();
}
