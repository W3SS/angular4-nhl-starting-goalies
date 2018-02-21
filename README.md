# Starting NHL Goalies Angular4 MySportsFeeds API, Heroku - <a href="https://nhl-starting-goalies-angular.herokuapp.com/">Demo</a> 
This is a single page app which uses the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#) to get starting NHL goalie data. 

### Description
This [application](https://nhl-starting-goalies-angular.herokuapp.com/) is made with Angular (version 4.2.4) and the most current version of angular material2. This SPA app is hosted for free on Heroku (cloud application platform). The data is sourced through the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#).

This app can help explain how to fetch data using [Angular's HttpClient Module](https://angular.io/guide/http) from a robust api.  

### You can learn this
* Create user authentication on firebase.
* Get realtime data updates from firebase. 
* Use Twitter Share Button module to post dynamic data.    
* [Use the HttpClient module to connect to an api and get data returned in milliseconds.](https://www.ianposton.com/angular4-httpclient/)
* [Deploy an Angular4 app to Heroku.](https://www.ianposton.com/angular4-deploy-to-heroku/) 

### Software used for this application
* Angular (version 4.2.4) 
* Angular CLI (version 1.4.5)
* Angular http (version 4.2.4)
* Node.js (version 6.10.3)     
* [angular material2](https://github.com/angular/material2) (version 2.0.0-beta.12)
* Heroku [Set up a free account ](https://www.heroku.com/)
* [Firebase](https://firebase.google.com/) (version 4.2.0) 
* AngularFire2 (version 4.0.0-rc.1)
* [ng2share](https://github.com/cedvdb/ng2share) (version 1.3.6) 
* NPM (version 5.2.0)
* Heroku Client (version 3.0.3)
* rxjs (version 5.4.2)
* [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#)

### Clone and serve this app
* First you will need to be given access MySportsFeeds NHL endpoints. As a developer working on a non-commercial app you can be given access to the NHL endpoints. Sign up at MySportsFeeds and use the username and password in the header request to authenticate the api get request. `let headers = new Headers({ "Authorization": "Basic " + btoa('username' + ":" + 'password') });`
* When the api headers are in place clone this repo and run <code>npm install</code> then run <code>ng serve</code> to serve the app on `localhost:4200`. Be careful not to push your api password to github.

### Create user authentication with firebase
The purpose of this app is to show each days confirmed starting NHL goalies. The api provides a best guess and the actual starter does not get updated to until well into game time. This created a lot of false data being represented on this app. I created a system of indicators that work with a Boolean. If a NHl goalie is a guess then I will show an orange expected indicator in my app next to the goalie, if the NHL goalie has been confirmed by his team I will show a green confirmed indicator next to the goalie. 

Since I could not rely on the api to update a confirmed starting goalie fast enough I needed to source my own data and and update the goalie's starting status manually. This means I made my own goalie json file and synced it to the api using each goalies ID. I added an expected and confirmed attribute to each goalie when the app loads. Now I can update those attributes on the ng-model of each goalie and save it to my firebase db. This will get me quicker updates and avoid showing false data by overriding the returned data from the api. 

I created a small cms to allow me to update the goalies status by clicking on their image to toggle true or false. I created a view that can only be accessed by me so that a random user wouldn't be able to make un-wanted changes to my app. In order to lock off this cms admin zone just for me I used firebase to create a special user authentication token. If I use the correct name and password my cms will appear and I can make quick updates right in the view where I want to see them.

* Create a firebase user by going to your firebase console and in the side nav under Develop click on the <code>Authentication</code> option. 
* In Authentication go to the SIGN-IN METHOD tab and enable Email/Password. 
* Then click on USERS tab and click ADD USER button. Enter an email and password.
* [Set up firebase in angular4 app](https://www.ianposton.com/angular4-with-firebase-mysportsfeeds-api-part-3/) (follow first part of this link). 
* Make a firbase service to handle saving data and retrieving data from the db. 

```ts
  
  //firebase.service.ts

import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Injectable()
export class FirebaseService {

  items:FirebaseListObservable<any[]>;
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(public af: AngularFireDatabase, private firebaseAuth: AngularFireAuth) {
    this.items = af.list('/items'); 
    this.user = firebaseAuth.authState;

      this.user.subscribe(
          (user) => {
            if (user) {
              this.userDetails = user;
              //console.log(this.userDetails);
            }
            else {
              this.userDetails = null;
            }
          }
        );
    
  }

 signInRegular(email, password) {
   const credential = firebase.auth.EmailAuthProvider.credential( email, password );
   return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password)
 }


  logout() {
    this.firebaseAuth.auth.signOut();
  }


  getData() {
    console.log('getting starter data from firebase...');
    return this.items = this.af.list('/items');
  }
}


```

* Include the firbase service in the app.module.ts in providers. 
* Define the user model in the app.component.ts, create a function and call the function from the html form.

```ts

//app.component.ts

import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  
  constructor(private fbService: FirebaseService){}

  public signInWithEmail() {
    this.fbService.signInRegular(this.user.email, this.user.password)
      .then((res) => {
        //success
      })
      .catch((err) => console.log('error: ' + err));
  }


  ngOnInit() {
     
    
  }

}

```

```html

//app.component.html

<div class="login-container">
 
  <input matInput type="email" class="form-control" [(ngModel)]="user.email" placeholder="Email" required>
  
  <input matInput type="password" class="form-control" [(ngModel)]="user.password" placeholder="Password" required>

  <button mat-raised-button class="mat-raised-button" (click)="signInWithEmail()">Login</button>

</div> 

```

The key here is in the firebase service <code>this.firebaseAuth.auth.signInWithEmailAndPassword(email, password)</code> This specifically talks to firebase. If the email and password are correct firebase will return a user object and it can be detected from the firebase service and can be used to show/hide add/edit/delete data features in the client. Using the same html form I can use <code>fbService.userDetails</code> to hide the log in form and show the log out button to end the session. 

```html

//app.component.html

<div class="login-container" *ngIf="fbService.userDetails == null">
 
  <input matInput type="email" class="form-control" [(ngModel)]="user.email" placeholder="Email" required>
  
  <input matInput type="password" class="form-control" [(ngModel)]="user.password" placeholder="Password" required>

  <button mat-raised-button class="mat-raised-button" (click)="signInWithEmail()">Login</button>

</div> 

 
<div *ngIf="fbService.userDetails != null">
 <button mat-raised-button class="mat-raised-button" color="warn"  (click)="fbService.logout()">Logout</button>
</div>

```

In the next article I will expand a bit more on how to use the user authentication to create an admin area to edit data and update the view in realtime without refreshing the page.

### Get realtime data updates from firebase.

I created a small cms to allow me to update the status of my data by clicking on a image to toggle true or false. I created a view that can only be accessed by an authenticated user so that a random user wouldn't be able to make un-wanted changes to my app. I also adjusted my firebase db rules to only allow write access if authenticated. In order to lock off this cms admin zone just for me I used firebase to create a special user authentication token. If I use the correct email and password that I setup when I added a user to my db, my cms will appear and I can make quick updates right in the view where I want to see them.

* In your firebase db dashboard set db rules to only allow write access if authenticated. Click the RULES tab and add this block of code. 

```js 

{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}

```

* Use the <code>ngIf="fbService.userDetails != null"</code> to show/hide html. Follow instructions above to setup authentication. 

```html

<div *ngIf="fbService.userDetails != null">
  <div class="edit-list-container" *ngIf="fullFirebaseResponse != null">
   
      <input matInput type="text" class="form-control" [(ngModel)]="fullFirebaseResponse[0]['todayDate']">
    
    <ul>
     
      <li *ngFor="let group of myData">
        <ul>
          <li *ngFor="let goalie of allGoalies">

            <span *ngIf="goalie[group.player.ID] != null" (click)="goalie[group.player.ID].probable = !goalie[group.player.ID].probable" [(ngModel)]="allGoalies[0][group.player.ID].probable" ngDefaultControl>
            <img src="{{group.player.image}}" alt="">{{group.player.LastName}}</span>

            <span *ngIf="goalie[group.player.ID] != null && goalie[group.player.ID].probable === false" style="color: red">X</span>

            <span *ngIf="goalie[group.player.ID] != null && allGoalies[0][group.player.ID].filterOutStarters == null && goalie[group.player.ID].probable === true && goalie[group.player.ID].confirmed === false" (click)="goalie[group.player.ID].confirmed = !goalie[group.player.ID].confirmed" [(ngModel)]="allGoalies[0][group.player.ID].confirmed" ngDefaultControl style="color: orange;">Probable</span>

            <span *ngIf="goalie[group.player.ID] != null && goalie[group.player.ID].probable === true && goalie[group.player.ID].confirmed === true" style="color: #2ecc71;" (click)="goalie[group.player.ID].confirmed = !goalie[group.player.ID].confirmed" [(ngModel)]="allGoalies[0][group.player.ID].confirmed" ngDefaultControl>Confirmed</span>

            <span *ngIf="goalie[group.player.ID] != null">({{group.stats.stats.Wins['#text'] + '-' + group.stats.stats.Losses['#text'] + '-' + group.stats.stats.OvertimeLosses['#text']}})</span>

          </li>
        </ul>
      </li>

    </ul>

    <div>
      <button (click)="save()">Save</button>
    </div>

</div> <!-- END OF AUTHENTICATED ADIM AREA -->

```



 




