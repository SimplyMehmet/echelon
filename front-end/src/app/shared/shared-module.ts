import { NgModule } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { TwitchStream } from './twitch-stream/twitch-stream';
import { Leaderboards } from './leaderboards/leaderboards';

@NgModule({
  declarations: [],
  imports: [CommonModule, TwitchStream, Leaderboards],
  exports: [TwitchStream, Leaderboards],
})
export class SharedModule {}
