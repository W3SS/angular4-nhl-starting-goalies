# Starting NHL Goalies Angular4 MySportsFeeds API, Heroku - <a href="https://nhl-starting-goalies-angular.herokuapp.com/">Demo</a> 
This is a single page app which uses the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#) to get starting NHL goalie data. 

### Description
This [application](https://nhl-starting-goalies-angular.herokuapp.com/) is made with Angular (version 4.2.4) and the most current version of angular material2. This SPA app is hosted for free on Heroku (cloud application platform). The data is sourced through the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#).

This app can help explain how to fetch data using [Angular's HttpClient Module](https://angular.io/guide/http) from a robust api.  

### You can learn this
* Use the HttpClient module to connect to an api and get data returned in milliseconds. 
* Deploy an Angular4 app to Heroku. 
* Use api response to make custom data not provided by the api. 
* Make multiple api calls dynamically by id. 
* Use Twitter Share Button module to post dynamic data.    

### Software used for this application
* Angular (version 4.2.4) 
* Angular CLI (version 1.4.5)
* Angular http (version 4.2.4)
* Node.js (version 6.10.3)     
* [angular material2](https://github.com/angular/material2) (version 2.0.0-beta.12)
* Heroku [Set up a free account ](https://www.heroku.com/)
* [ng2share](https://github.com/cedvdb/ng2share) (version 1.3.6) 
* NPM (version 5.2.0)
* Heroku Client (version 3.0.3)
* rxjs (version 5.4.2)
* [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#)

### Clone and serve this app
* First you will need to be given access MySportsFeeds NHL endpoints. As a developer working on a non-commercial app you can be given access to the NHL endpoints. Sign up at MySportsFeeds and use the username and password in the header request to authenticate the api get request. `let headers = new Headers({ "Authorization": "Basic " + btoa('username' + ":" + 'password') });`
* When the api headers are in place clone this repo and run <code>npm install</code> then run <code>ng serve</code> to serve the app on `localhost:4200`. Be careful not to push your api password to github.

### Get data from api with HttpClient module
The first thing I want to do in this app is get a list of all the pitchers in major league baseball. I used the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#) to find the correct endpoint to get all pitchers. I am able to use Angular's http module to send a GET request for data using this endpoint `https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-regular/active_players.json?position=G` found in the api's documentation. 

```ts

//app.component.ts 

import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';

let headers = new Headers({ "Authorization": "Basic " + btoa('username' + ":" + 'password') });
let options = new RequestOptions({ headers: headers });
let url = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/cumulative_player_stats.json?position=G';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
   
   statData: Array<any>;

   constructor(private http: Http) {}

   loadData() {
    this.http.get(url, options)
     .map(response => response.json())
      .subscribe(res => {
        console.log(res['cumulativeplayerstats'].playerstatsentry, 'got player info res!');
        this.statData = res['cumulativeplayerstats'].playerstatsentry;
      });
   }

   ngOnInit() {
    loadData();
   }
}

```

```html

//app.component.html

 <ul>
  <li *ngFor="let data of statData"> 
    {{ data.player.FirstName + ' ' + data.player.LastName + ' - ' + data.team.Abbreviation }}
  </li>
 </ul>

```

### Deploy an Angular4 app to Heroku.
* For Heroku this app uses a node.js server <code>app.js</code> with express.
* All routes will be going to <code>dist/index.html</code>. 
* Run <code>ng build</code> to build the app in the dist directory.
* Run <code>node app.js</code> to serve the app at `http://localhost:3001`.
* The <code>Procfile</code> in this app's root specifies the server for heroku to use.

```
//Procfile

web: node app.js

```

* This <code>"main": "app.js"</code> line in package.json specifies how to tell heroku to look for <code>app.js</code>.
* Before pushing to github, before heroku deploy set Config Variables.  

Adding the environment variable for the MySportsFeeds api. I didn't want to share my api headers information in my github repository so I added my password to my Config Variables for heroku to use in the app settings from the Heroku dashboard. I stored the password in my heroku app by going to the app settings in my heroku dashboard. Click on Config Variables and add the key (name) and value (password) there. It will be secured safely away from human view. You can call it to the client side by adding this code to the app.js file. I called my env `TOKEN` and made the value MySportsFeeds password.


* Use the [Heroku Client API](https://github.com/heroku/node-heroku-client) to retrieve the `TOKEN` from the app and then send it to the front-end of the angular app like this.

* I used my heroku account token to authenticate Heroku Client. I saved it to the config vars of this app as `API_TOKEN`.

```ts

//app.js 

const express = require('express');
const http = require('http');
const path = require('path');
const Heroku = require('heroku-client')
const heroku = new Heroku({ token: process.env.API_TOKEN })
const api = require('./server/routes/api');
const app = express();

let TOKEN = '';

app.use(express.static(path.join(__dirname, 'dist')));

//GET CONFIG VAR FROM SPECIFIC HEROKU APP
heroku.request({
  method: 'GET',
  path: 'https://api.heroku.com/apps/my-app-name/config-vars',
  headers: {
    "Accept": "application/vnd.heroku+json; version=3",
    "Authorization": "Bearer "+process.env.API_TOKEN
  },
  parseJSON: true
}).then(response => {
  //console.log(response.API_KEY, "heroku api from server");
  TOKEN = response.TOKEN;
})

//SEND CONFIG VAR TO FRONT-END APP.COMPONENT.TS
app.get('/heroku-env', function(req, res){
        res.write(TOKEN);
        res.end();
});

//SPECIFY NG-BUILD PATH
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
});

//HEROKU PORT
const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

```
* Get the environment variable sent from heroku to app.component using Http. 

```ts

//app.component.ts 

import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
   
  defineToken: string = '';

   constructor(private http: Http) {}

   getEnv() {
    console.log("trying to get heroku env...");
      this.http.get('/heroku-env').map(response => response)
      .subscribe(res => {
        this.defineToken = res._body;
        let headers = new Headers({ "Authorization": "Basic " + btoa('ianposton' + ":" + this.defineToken) });
        let options = new RequestOptions({ headers: headers });
      });
   }

   ngOnInit() {
    this.getEnv();
   }
}

```

After you <code>git push</code> to your repo follow the steps below. Assuming you have a heroku account and installed the heroku toolbelt. 
<ol>
  <li>run <code>heroku log in</code></li>
  <li>run <code>heroku create name-of-app</code></li>
  <li>run <code>git push heroku master</code></li>
  <li>If deploy is successful run <code>heroku open</code></li>
  If there were problems during deploy and you are trying this from scratch here are some requirements heroku needs to deploy.
  <li>Have <code>@angular/cli</code> and <code>@angular/compiler-cli</code> listend under dependencies in <code>package.json</code>.</li>
  <li>have a <code>server/routes</code> directory with <code>api.js</code> </li>
</ol>

```js

//api.js

const express = require('express');
const router = express.Router();

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

module.exports = router;

```
</ol>

References for deploying Angular4 to heroku: [https://medium.com/@ervib/deploy-angular-4-app-with-express-to-heroku-6113146915ca](https://medium.com/@ervib/deploy-angular-4-app-with-express-to-heroku-6113146915ca)

### Make multiple api calls dynamically.
In this app I needed to get a week worth of game data. To do this I need to get the schedule for the week and strip all the game ID's then dynamically assign the id to call for each game and get detailed stats from that game.

* In `app.component.ts` `import 'rxjs/add/observable/forkJoin';`. 
* Make an api call to MySportsFeeds api to get all games played last week.
* ForEach loop through the response and use forkJoin to call for sever game results by using the game ID dynamically in the url (endpoint).

```ts

//app.compoent.ts

import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

let headers = new Headers({ "Authorization": "Basic " + btoa('username' + ":" + 'password') });
let options = new RequestOptions({ headers: headers });
let url = 'https://api.mysportsfeeds.com/v1.1/pull/mlb/2017-playoff/full_game_schedule.json?date=from-8-days-ago-to-2-days-ago';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

   activePlayerData: Array<any>;
   cumulativePlayerStatData: Array<any>;
   showData: Array<any>;

   constructor(private http: Http) {}
  
    loadData() {
      this.http.get(url, options)
        .map(response => response.json())
          .subscribe(res => {
            console.log( res['fullgameschedule'].gameentry, 'games from last week!');
            
            //FORKJOIN HELPS MAKE SEVERAL API CALLS
            //STRIP THE GAME ID AND USE IT dynamically IN THE API CALL + g.id +
            Observable.forkJoin(
              res['fullgameschedule'].gameentry.map(
                 g =>
                 this.http.get('https://api.mysportsfeeds.com/v1.1/pull/mlb/2017-regular/game_playbyplay.json?gameid=' + g.id + '&status=final', options)
                 .map(response => response.json())
               )
             ).subscribe(res => {
                 //THIS WILL LOG GAME RESULTS SUCH AS HITS/PITCHES/STOLENBASES/RUNS...
                 let i;
                 res.forEach((item, index) => {
                   i = index;
                   console.log(res[i]['gameplaybyplay'], 'got game data!');
                 })
              })
          })
   }

    
   ngOnInit() {
    this.loadData();
   }

}

```

* This is an example of getting lots of data to store to your db in firebase. Avoid making a lot of api calls like shown above each time the app loads. 
* Tread carefully when making this many get requests to an api. Most api's have request limits. MySportsFeeds has a 250 request limit which resets every 5 minutes. Meaning if there are more than 250 requests in less than 5 minutes, following requests will be rejected until the 5 minute hold resets.  

### Make custom data.
In this app I use one array to show all data in the views. I use 5 different endpoints to get different information about each player. In order to sort the data and apply it to the correct player I use the responses returned by the endpoints, for each loop through the response and match data by player ID so that the custom data can be added to the player object and stored in one array for the view. 

* Call two api endpoints when the app is loaded. 
* Use a condition to wait for the response to come back before sorting data by player ID. 
* Use a nested forEach loop to get the response items. 
* If player ID is a match create a new key on the player object and assign a value.
* After the forEach loop is done assign the array to a new Array for the view to display the custom data. 

```ts

//app.compoent.ts

import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';

let headers = new Headers({ "Authorization": "Basic " + btoa('username' + ":" + 'password') });
let options = new RequestOptions({ headers: headers });
let url1 = 'https://api.mysportsfeeds.com/v1.1/pull/mlb/2017-regular/active_players.json?position=P';
let url2 = 'https://api.mysportsfeeds.com/v1.1/pull/mlb/2017-regular/cumulative_player_stats.json?position=P&sort=STATS.Pitching-NP.D&limit=275';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

   activePlayerData: Array<any>;
   cumulativePlayerStatData: Array<any>;
   showData: Array<any>;

   constructor(private http: Http) {}
  
    loadData() {
      this.http.get(url, options)
        .map(response => response.json())
          .subscribe(res => {
          console.log(res['activeplayers'].playerentry, 'got active player data from api!');
          this.activePlayerData = res['activeplayers'].playerentry;
      });
      
      this.loadOtherData();

   }

   loadOtherdata() {
    this.http.get(url, options)
     .map(response => response.json())
      .subscribe(res => {
        console.log(res['cumulativeplayerstats'].playerstatsentry, 'got player info res!');
        this.cumulativePlayerStatData = res['cumulativeplayerstats'].playerstatsentry;
      });
      
      //USE A CONDITION TO CHECK BOTH ARRAYS
      if (this.cumulativePlayerStatData && this.activePlayerData) {
        //NESTED FOREACH LOOP
        for (let info of this.activePlayerData) { 
          for (let data of this.cumulativePlayerStatData) {
            //CHECK IF PLAYER ID IS MATCH THEN APPLY CUSTOM DATA TO BE ADDED
            //TO cumulativePlayerStatData PLAYER ITEMS
            if (data.player.ID === info.player.ID) {
              data.player.image = info.player.officialImageSrc;
              data.player.age = info.player.Age;
              data.player.city = info.player.BirthCity;
              data.player.country = info.player.BirthCountry;
              data.player.Height = info.player.Height;
              data.player.Weight = info.player.Weight;
              data.player.IsRookie = info.player.IsRookie;

              //SHOWDATA IS CALLED IN THE HTML WITH NEW CUSTOM DATA ADDED
              this.showData = this.cumulativePlayerStatData;
            } 
          }
        }
      } 
   }
    
   ngOnInit() {
     this.loadData();
   }

}

```

```html

//app.compoent.html

<div *ngFor="let data of showData">
 <p>{{ data.player.FirstName + ' ' + data.player.LastName + ' (' + data.team.Name + ' - ' + data.player.Position + ')'}} <span *ngIf="data.player.IsRookie == 'true'" style="background:#2ecc71; color:#fff; padding:1px; border-radius:2px;">Rookie</span>
      <br> Age: {{data.player.age}} Height: {{data.player.Height}} Weight: {{data.player.Weight}}
      <br> Birth City: {{data.player.city +', '+ data.player.country}}
      <br> Number: {{data.player.JerseyNumber}}</p>
</div>

```

