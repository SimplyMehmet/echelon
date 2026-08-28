import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Weekly } from '@core/domain';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  selector: 'app-weekly-card',
  styleUrl: './weekly-card.css',
  templateUrl: './weekly-card.html',
})
export class WeeklyCard {
  readonly weekly = input.required<Weekly>();
}
