import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiClient } from './api';

describe('ApiClient', () => {
  const setup = (platform: 'browser' | 'server') => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return {
      service: TestBed.inject(ApiClient),
      http: TestBed.inject(HttpTestingController),
    };
  };

  it('should be created', () => {
    expect(setup('browser').service).toBeTruthy();
  });

  it('should fetch in the browser', () => {
    const { service, http } = setup('browser');
    service.get('/player').subscribe();
    http.expectOne((r) => r.url.endsWith('/player'));
  });

  it('should not fetch while prerendering', () => {
    const { service, http } = setup('server');
    service.get('/player').subscribe();
    http.expectNone((r) => r.url.endsWith('/player'));
  });
});
