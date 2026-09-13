import { Component, DOCUMENT, inject, OnDestroy, OnInit } from '@angular/core';
import { LeaderboardsBanner } from '@app/shared/leaderboards-banner/leaderboards-banner';
import { TwitchStream } from '@app/shared/twitch-stream/twitch-stream';

@Component({
  imports: [TwitchStream, LeaderboardsBanner],
  selector: 'app-full-screen',
  styleUrl: './full-screen.css',
  templateUrl: './full-screen.html',
})
export class FullScreen implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  ngOnInit(): void {
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = 'visible';
  }
}
