import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardsBanner } from './leaderboards-banner';

describe('Leaderboards', () => {
  let component: LeaderboardsBanner;
  let fixture: ComponentFixture<LeaderboardsBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardsBanner],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardsBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch the visible category from the tabs', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const hidden = () => element.querySelectorAll('.leaderboard-wrapper.max-sm\\:hidden').length;
    expect(hidden()).toBe(3);

    const tabs = element.querySelectorAll<HTMLButtonElement>('.filter-button');
    expect(tabs.length).toBe(4);
    tabs[2].click();
    await fixture.whenStable();

    const wrappers = element.querySelectorAll('.leaderboard-wrapper');
    expect(wrappers[2].classList.contains('max-sm:hidden')).toBe(false);
    expect(wrappers[0].classList.contains('max-sm:hidden')).toBe(true);
    expect(hidden()).toBe(3);
  });

  it('should show an error when a request fails', async () => {
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.url.endsWith('/team'))
      .flush('failed', { status: 500, statusText: 'Server Error' });
    http.expectOne((r) => r.url.endsWith('/player')).flush({ players: [] });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Couldn't load");
  });
});
