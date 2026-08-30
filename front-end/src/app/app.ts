import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreModule } from '@app/core/core-module';

@Component({
  imports: [RouterOutlet, CoreModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
