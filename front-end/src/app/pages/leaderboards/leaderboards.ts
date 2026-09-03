import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerResponse } from '@app/api/responses/player';
import { Player } from '@app/api/services/player';

@Component({
  imports: [],
  selector: 'app-leaderboards',
  styleUrl: './leaderboards.css',
  templateUrl: './leaderboards.html',
})
export class Leaderboards {
  private playerService = inject(Player);
  private playersData = toSignal(this.playerService.getAllPlayers(), { initialValue: null });
  public players: Signal<PlayerResponse[]> = computed(() => {
    const data = this.playersData();
    if (data === null) {
      return [];
    }

    return data.players;
  });
}
