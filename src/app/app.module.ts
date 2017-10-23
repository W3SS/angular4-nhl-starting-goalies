import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatGridListModule, MatToolbarModule, MatSnackBarModule, MatButtonModule } from '@angular/material';
import { DataService } from './data.service';

import { AppComponent, Info } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    Info
  ],
  imports: [
    BrowserModule,
    HttpModule,
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatButtonModule, 
    BrowserAnimationsModule
  ],
  providers: [DataService],
  entryComponents: [
    Info
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
