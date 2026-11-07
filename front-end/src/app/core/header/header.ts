import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
  imports: [RouterLink, RouterModule],
})
export class Header {
  public menuOpen = signal(false);

  constructor() {}

  public toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  public closeMenu() {
    this.menuOpen.set(false);
  }
}
