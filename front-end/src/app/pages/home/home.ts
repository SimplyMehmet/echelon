import { Component } from '@angular/core';
import { LeaderboardsBanner } from './components/leaderboards-banner/leaderboards-banner';
import { TwitchStream } from './components/twitch-stream/twitch-stream';

@Component({
  imports: [LeaderboardsBanner, TwitchStream],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
