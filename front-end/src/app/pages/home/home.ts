import { Component } from '@angular/core';
import { TwitchStream } from '@app/shared/twitch-stream/twitch-stream';

@Component({
  imports: [TwitchStream],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
