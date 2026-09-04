import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
  imports: [RouterLink, RouterModule],
})
export class Header {}
