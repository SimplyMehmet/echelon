import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app';
import { EchelonData } from '@core/data/echelon-data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        // One line, and the whole point of the seam being an abstract class.
        { provide: EchelonData, useValue: {} as EchelonData },
      ],
    }).compileComponents();
  });

  it('creates the shell', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });
});
