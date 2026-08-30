import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared-module';

@Component({
  imports: [SharedModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
