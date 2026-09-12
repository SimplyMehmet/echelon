import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardsBanner } from './leaderboards-banner';

describe('Leaderboards', () => {
  let component: LeaderboardsBanner;
  let fixture: ComponentFixture<LeaderboardsBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardsBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardsBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
