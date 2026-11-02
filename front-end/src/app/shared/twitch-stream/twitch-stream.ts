import { Component, DOCUMENT, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-twitch-stream',
  styleUrl: './twitch-stream.css',
  templateUrl: './twitch-stream.html',
})
export class TwitchStream implements OnInit {
  public twitchChannelUrl: SafeUrl = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.twitchChannelUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.twitch.tv/?channel=levelsgamingtv&parent=${environment.parentDomain}`,
    );
  }
}
