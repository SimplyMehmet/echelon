import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-error-state',
  styleUrl: './error-state.css',
  templateUrl: './error-state.html',
})
export class ErrorState {
  readonly error = input<unknown>();
  readonly retry = output<void>();

  protected readonly message = computed(() => {
    const error = this.error();
    return error instanceof Error ? error.message : 'Something went wrong loading this page.';
  });
}
