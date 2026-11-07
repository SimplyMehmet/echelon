import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([{ path: 'events', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const toggle = () => fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
  const menu = () => fixture.nativeElement.querySelector('.mobile-menu') as HTMLElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the mobile menu from the toggle', async () => {
    expect(menu().classList.contains('open')).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    toggle().click();
    await fixture.whenStable();
    expect(menu().classList.contains('open')).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');

    toggle().click();
    await fixture.whenStable();
    expect(menu().classList.contains('open')).toBe(false);
  });

  it('should close the mobile menu from the backdrop', async () => {
    toggle().click();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.mobile-backdrop') as HTMLElement).click();
    await fixture.whenStable();
    expect(menu().classList.contains('open')).toBe(false);
  });

  it('should close the mobile menu on escape and return focus to the toggle', async () => {
    document.body.appendChild(fixture.nativeElement);
    toggle().click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(menu().classList.contains('open')).toBe(false);
    expect(document.activeElement).toBe(toggle());
    fixture.nativeElement.remove();
  });

  it('should close the mobile menu on navigation', async () => {
    toggle().click();
    await fixture.whenStable();

    await TestBed.inject(Router).navigateByUrl('/events');
    await fixture.whenStable();
    expect(menu().classList.contains('open')).toBe(false);
  });
});
