import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { EchelonData } from '@core/data/echelon-data';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {
  private readonly data = inject(EchelonData);

  protected readonly meta = resource({
    loader: () => this.data.getScoringMeta(),
  });
}
