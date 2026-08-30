import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '@app/core/header/header';
import { Footer } from '@app/core/footer/footer';

@NgModule({
  declarations: [],
  imports: [CommonModule, Header, Footer],
  exports: [Header, Footer],
})
export class CoreModule {}
