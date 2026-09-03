import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './core/footer/footer';
import { Header } from './core/header/header';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
