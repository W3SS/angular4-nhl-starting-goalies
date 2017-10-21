import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatGridListModule, MatToolbarModule } from '@angular/material';
import { DataService } from './data.service';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatToolbarModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
