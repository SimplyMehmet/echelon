import {
  afterNextRender,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

const CHANNEL = 'levelsgamingtv';
const EMBED_SCRIPT = 'https://player.twitch.tv/js/embed/v1.js';

type TwitchPlayerApi = {
  new (
    element: HTMLElement,
    options: { channel: string; parent: string[]; width: string; height: string },
  ): { addEventListener(event: string, callback: () => void): void };
  ONLINE: string;
  OFFLINE: string;
};

type TwitchWindow = Window & { Twitch?: { Player: TwitchPlayerApi } };

let embedScript: Promise<TwitchPlayerApi> | null = null;

function loadEmbedScript(document: Document): Promise<TwitchPlayerApi> {
  embedScript ??= new Promise<TwitchPlayerApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = EMBED_SCRIPT;
    script.onload = () => {
      const player = (document.defaultView as TwitchWindow).Twitch?.Player;
      if (player) {
        resolve(player);
      } else {
        reject(new Error('Twitch embed script did not define a player'));
      }
    };
    script.onerror = () => reject(new Error('Twitch embed script failed to load'));
    document.head.appendChild(script);
  }).catch((error) => {
    embedScript = null;
    throw error;
  });
  return embedScript;
}

@Component({
  selector: 'app-twitch-stream',
  styleUrl: './twitch-stream.css',
  templateUrl: './twitch-stream.html',
})
export class TwitchStream implements OnInit {
  public twitchChannelUrl: SafeUrl = '';
  public channelPageUrl = `https://www.twitch.tv/${CHANNEL}`;
  public offline = signal(false);
  // Without the script there's no live status, so fall back to the plain player.
  public embedFailed = signal(false);

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private playerHost = viewChild.required<ElementRef<HTMLElement>>('playerHost');

  constructor(private sanitizer: DomSanitizer) {
    afterNextRender(() => this.createPlayer());
  }

  ngOnInit(): void {
    this.twitchChannelUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.twitch.tv/?channel=${CHANNEL}&parent=${environment.parentDomain}`,
    );
  }

  private async createPlayer() {
    let destroyed = false;
    this.destroyRef.onDestroy(() => (destroyed = true));

    try {
      const Player = await loadEmbedScript(this.document);
      if (destroyed) {
        return;
      }
      const player = new Player(this.playerHost().nativeElement, {
        channel: CHANNEL,
        parent: [environment.parentDomain],
        width: '100%',
        height: '100%',
      });
      player.addEventListener(Player.OFFLINE, () => this.offline.set(true));
      player.addEventListener(Player.ONLINE, () => this.offline.set(false));
    } catch {
      this.embedFailed.set(true);
    }
  }
}
