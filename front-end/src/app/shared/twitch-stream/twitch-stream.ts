import { Component, DOCUMENT, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-twitch-stream',
  styleUrl: './twitch-stream.css',
  templateUrl: './twitch-stream.html',
})
export class TwitchStream {
  public twitchChannelUrl: SafeUrl = '';

  constructor(private sanitizer: DomSanitizer) {
    this.twitchChannelUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.twitch.tv/?channel=levelsgamingtv&parent=${environment.parentDomain}`,
    );
  }
}
