import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Each route declares only its own fragment; the brand suffix is appended here. */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const fragment = this.buildTitle(snapshot);
    this.title.setTitle(fragment ? `${fragment} · Edgelon` : 'Edgelon');
  }
}
