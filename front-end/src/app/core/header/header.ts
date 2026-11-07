import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
  imports: [RouterLink, RouterModule],
})
export class Header {
  public menuOpen = signal(false);
  private menuToggle = viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');

  constructor() {
    // Covers navigation that doesn't go through the menu, such as the browser's back button.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  public toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  public closeMenu() {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  public onEscape() {
    if (this.menuOpen()) {
      this.closeMenu();
      this.menuToggle().nativeElement.focus();
    }
  }
}
