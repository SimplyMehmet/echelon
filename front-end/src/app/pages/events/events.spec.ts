import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GetEventResponse } from '@app/api/responses/event';
import { Events, sortEvents } from './events';

describe('Events', () => {
  let component: Events;
  let fixture: ComponentFixture<Events>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Events],
    }).compileComponents();

    fixture = TestBed.createComponent(Events);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list upcoming events soonest first, then past events newest first', () => {
    const event = (id: string, startsAt: string): GetEventResponse => ({
      id,
      startsAt,
      name: id,
      location: '',
      entrants: 0,
    });
    const now = new Date('2026-06-15T00:00:00Z').getTime();

    const sorted = sortEvents(
      [
        event('oldest', '2026-01-01T00:00:00Z'),
        event('later', '2026-09-01T00:00:00Z'),
        event('recent', '2026-05-01T00:00:00Z'),
        event('soonest', '2026-07-01T00:00:00Z'),
      ],
      now,
    );

    expect(sorted.map((e) => e.id)).toEqual(['soonest', 'later', 'recent', 'oldest']);
  });
});
