import { Component } from '@angular/core';
import { LeaderboardsBanner } from '@app/shared/leaderboards-banner/leaderboards-banner';
import { TwitchStream } from '@app/shared/twitch-stream/twitch-stream';

@Component({
  imports: [LeaderboardsBanner, TwitchStream],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
