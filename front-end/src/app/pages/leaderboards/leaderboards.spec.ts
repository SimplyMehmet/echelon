import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Leaderboards } from './leaderboards';

describe('Leaderboards', () => {
  let component: Leaderboards;
  let fixture: ComponentFixture<Leaderboards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Leaderboards],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Leaderboards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading, then an error when the request fails', async () => {
    const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text()).toContain('Loading');

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.url.endsWith('/player'))
      .flush('failed', { status: 500, statusText: 'Server Error' });
    http.expectOne((r) => r.url.endsWith('/team')).flush({ teams: [] });
    await fixture.whenStable();

    expect(text()).toContain("Couldn't load");
  });

  it('should keep tied scores as separate rows', async () => {
    const http = TestBed.inject(HttpTestingController);
    const player = (id: string) => ({
      id,
      name: id,
      attended: 1,
      scoreTotal: 10,
      scoreCurrent: 10,
      team: '',
    });
    http.expectOne((r) => r.url.endsWith('/player')).flush({ players: [player('a'), player('b')] });
    http.expectOne((r) => r.url.endsWith('/team')).flush({ teams: [] });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.placing-wrapper').length).toBe(2);
  });
});
