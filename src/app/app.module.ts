import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatGridListModule, MatToolbarModule, MatSnackBarModule, MatButtonModule } from '@angular/material';
import { DataService } from './data.service';
import { YesterdayService } from './yesterday.service';
import { TomorrowService } from './tomorrow.service';
import { ShareModule } from 'ng2share/share.module'
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { StartingGoaliesComponent, Info } from './starting-goalies/starting-goalies.component';
import { YesterdayResultsComponent } from './yesterday-results/yesterday-results.component';
import { TomorrowResultsComponent } from './tomorrow-results/tomorrow-results.component';

@NgModule({
  declarations: [
    AppComponent,
    Info,
    StartingGoaliesComponent,
    YesterdayResultsComponent,
    TomorrowResultsComponent
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
          path: 'starting-goalies',
           children: [
                      {
                  path: '',
                  pathMatch: 'full',
                  component: StartingGoaliesComponent,
                },
                {
                  path: 'yesterday',
                  component: YesterdayResultsComponent
                },
                {
                  path: 'tomorrow',
                  component: TomorrowResultsComponent
                }
            ]
        }
    ])
  ],
  providers: [DataService, YesterdayService, TomorrowService],
  entryComponents: [
    Info
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
