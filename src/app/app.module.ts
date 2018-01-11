import { masterFirebaseConfig } from './api-keys';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { MatCardModule, 
        MatGridListModule, 
        MatToolbarModule, 
        MatSnackBarModule, 
        MatButtonModule, 
        MatTabsModule, 
        MatMenuModule,
        MatListModule,
        MatChipsModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressSpinnerModule } from '@angular/material';
import { DataService } from './data.service';
import { YesterdayService } from './yesterday.service';
import { TomorrowService } from './tomorrow.service';
import { ShareModule } from 'ng2share/share.module'
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { StartingGoaliesComponent, Info, TodayDialog, LastweekDialog } from './starting-goalies/starting-goalies.component';
import { YesterdayResultsComponent, InfoYesterday } from './yesterday-results/yesterday-results.component';
import { TomorrowResultsComponent, InfoTomorrow, TomorrowDialog } from './tomorrow-results/tomorrow-results.component';

import { FirebaseService } from './firebase.service';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';


export const firebaseConfig = {
  apiKey: masterFirebaseConfig.apiKey,
  authDomain: masterFirebaseConfig.authDomain,
  databaseURL: masterFirebaseConfig.databaseURL
};

@NgModule({
  declarations: [
    AppComponent,
    Info,
    InfoYesterday,
    InfoTomorrow,
    StartingGoaliesComponent,
    YesterdayResultsComponent,
    TomorrowResultsComponent,
    TodayDialog,
    LastweekDialog,
    TomorrowDialog
  ],
  imports: [
    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule,
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatButtonModule, 
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ShareModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot([
        {
           path: '',
           redirectTo: 'starting-goalies',
           pathMatch: 'full'
        },
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
  providers: [DataService, YesterdayService, TomorrowService, FirebaseService],
  entryComponents: [
    Info, InfoYesterday, InfoTomorrow, TodayDialog, LastweekDialog, TomorrowDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
