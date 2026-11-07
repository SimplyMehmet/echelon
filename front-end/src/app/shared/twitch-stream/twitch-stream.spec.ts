import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwitchStream } from './twitch-stream';

describe('TwitchStream', () => {
  let component: TwitchStream;
  let fixture: ComponentFixture<TwitchStream>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwitchStream],
    }).compileComponents();

    fixture = TestBed.createComponent(TwitchStream);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the offline panel only while offline', async () => {
    expect(fixture.nativeElement.querySelector('.offline-panel')).toBeNull();

    component.offline.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.offline-panel')).not.toBeNull();

    component.offline.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.offline-panel')).toBeNull();
  });

  it('should fall back to the plain player if the embed script fails', async () => {
    component.embedFailed.set(true);
    await fixture.whenStable();

    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('channel=levelsgamingtv');
    expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
  });
});
