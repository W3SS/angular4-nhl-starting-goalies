# Starting NHL Goalies Angular4 MySportsFeeds API, Heroku - <a href="https://nhl-starting-goalies-angular.herokuapp.com/">Demo</a> 
This is a single page app which uses the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#) to get starting NHL goalie data. 

### Description
This [application](https://nhl-starting-goalies-angular.herokuapp.com/) is made with Angular (version 4.2.4) and the most current version of angular material2. This SPA app is hosted for free on Heroku (cloud application platform). The data is sourced through the [MySportsFeeds API](https://www.mysportsfeeds.com/data-feeds/api-docs/#).

This app can help explain how to fetch data using [Angular's HttpClient Module](https://angular.io/guide/http) from a robust api.  

### You can learn this
* Create a user authentication on firebase.
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

### Create a user authentication on firebase
The purpose of this app is to show each days confirmed starting NHL goalies. The api provides a best guess and the actual starter does not get updated to until well into game time. This created a lot of false data being represented on this app. I created a system of indicactors that work with a boolean. If a NHl goalie is a guess then I will show an  orange expected indicator in my app next to the goalie, if the NHL goalie has been confirmed by his team I will show a green confirmed indicator next to the goalie. 

Since I could not rely on the api to update a confirmed starting goalie fast enough I needed to source my own data and and update the goalie's starting status manually. This means I made my own goalie json file and synced it to the api using each goalies ID. I added an expected and confirmed atribute to each goalie when the app loads. Now I can update those atributes on the ng-model of each goalie and save it to my firebase db. This will get me quicker updates and avoid showing false data by overiding the returned data from the api. 

I created a small cms to allow me to update the goalies by clicking on their image to toggle true or false. I created a view that can only be accessed by me so that a random user wouldn't be able to make un-wanted changes to my app. In order to lock off this cms admin zone just for me I used firebase to create a special user authentication token. If I use the correct name and password my cms will appear and I can make quick updates right in the view where I want to see them.

*  




