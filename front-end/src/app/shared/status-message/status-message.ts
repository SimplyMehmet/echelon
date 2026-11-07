import { Component, input } from '@angular/core';

export type StatusMessageType = 'loading' | 'error' | 'empty';

@Component({
  selector: 'app-status-message',
  styleUrl: './status-message.css',
  templateUrl: './status-message.html',
})
export class StatusMessage {
  public status = input.required<StatusMessageType>();
  public emptyText = input('Nothing to show yet.');
}
