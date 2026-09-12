import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullScreen } from './full-screen';

describe('FullScreen', () => {
  let component: FullScreen;
  let fixture: ComponentFixture<FullScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(FullScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
