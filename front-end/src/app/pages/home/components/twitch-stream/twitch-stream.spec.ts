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
});
