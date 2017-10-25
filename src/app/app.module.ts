import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatGridListModule, MatToolbarModule, MatSnackBarModule, MatButtonModule } from '@angular/material';
import { DataService } from './data.service';
import { ShareModule } from 'ng2share/share.module'
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { StartingGoaliesComponent, Info } from './starting-goalies/starting-goalies.component';

@NgModule({
  declarations: [
    AppComponent,
    Info,
    StartingGoaliesComponent
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
    BrowserAnimationsModule,
    ShareModule,
    RouterModule.forRoot([
         {
          path: '',
          redirectTo: 'starting-goalies',
          pathMatch: 'full'
        },
        {
          path: 'starting-goalies',
          component: StartingGoaliesComponent
        }
    ])
  ],
  providers: [DataService],
  entryComponents: [
    Info
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
