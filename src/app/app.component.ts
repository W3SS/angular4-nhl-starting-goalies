import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

let thisDate = new Date();
let utcDate = new Date(thisDate.toUTCString());
utcDate.setHours(utcDate.getHours() - 8);
let myDate = new Date(utcDate);
let dailyDate = myDate.toISOString().slice(0, 10).replace(/-/g, "");
let headers = null;
let options = null;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  starters: Array < any > ;
  dailySchedule: Array < any > ;
  starterIdData: Array < any > = [];
  startersData: Array < any > = [];
  myData: Array < any > ;
  showData: Array < any > ;
  gameDate: string = '';
  defineToken: string = '';
  statData: Array < any > = [];
  playerInfo: Array < any > ;
  noGamesToday: boolean;
  gamesToday: boolean;

  constructor(private http: Http) {}

  loadData() {
   this.http.get('/heroku-env').map(response => response)
    .subscribe(res => {
        
        headers = new Headers({ "Authorization": "Basic " + btoa('ianposton' + ":" + res['_body']) });
        options = new RequestOptions({ headers: headers }); 
        this.getSchedule();

      })
  }

  getSchedule() {

    let url = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/daily_game_schedule.json?fordate='+dailyDate;
    console.log('getting scheduled games for today from API...');
    this.http.get(url, options)
      .map(response => response.json())
      .subscribe(res => {

        console.log(res, "schedule...");
        this.dailySchedule = res['dailygameschedule'].gameentry;
        this.gameDate = res['dailygameschedule'].gameentry[0].date;
        if (res['dailygameschedule'].gameentry == null) {
          this.noGamesToday = true;
          console.log('There are no games being played today.');
        } else {
          this.gamesToday = true;

          Observable.forkJoin(
              res['dailygameschedule'].gameentry.map(
                g =>
                this.http.get('https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/game_startinglineup.json?gameid=' + g.id + '&position=Goalie-starter', options)
                .map(response => response.json())
              )
            )
            .subscribe(res => {
              console.log(res, 'making several calls by GAME ID for starting lineups...');

              let i;
              let i2;
              let res2;
              res.forEach((item, index) => {
                i = index;
                console.log(res[i]['gamestartinglineup'].teamLineup, 'got starting lineups data!');
                res2 = res[i]['gamestartinglineup'].teamLineup;
                //this.gameTime =  res[i]['gamestartinglineup'].game.date;
                res2.forEach((item, index) => {

                  i2 = index;
                  if (res2[i2].expected != null) {
                    console.log(res2[i2].expected.starter[0].player.ID, 'got player ID for goalie expected to start!');
                    this.starterIdData.push(res2[i2].expected.starter[0].player.ID);
                  } else {
                    console.log(res2[i2].team.City + " " + res2[i2].team.Name, 'no starters yet!');
                    this.starterIdData.push(res2[i2].team.ID);
                    //this.starterIdData.push(res2[i2].expected.starter[0].player.ID);
                    //console.log(this.starterIdData, 'this array has ALL the IDs of todays starters');
                  }

                });
              });

              this.sortData();

            });

        }

      })
    let url2 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/cumulative_player_stats.json?position=G';
    this.http.get(url2, options)
      .map(response => response.json())
      .subscribe(res => {

        console.log(res['cumulativeplayerstats'].playerstatsentry, "cumulative stats...");
        this.myData = res['cumulativeplayerstats'].playerstatsentry;
      })

    let url3 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/active_players.json?position=G';
    this.http.get(url3, options)
      .map(response => response.json())
      .subscribe(res => {

        console.log(res['activeplayers'].playerentry, "active players stats...");
        this.playerInfo = res['activeplayers'].playerentry;
      })
  }

  sortData() {
    console.log('trying to sort starters...');

    if (this.myData && this.dailySchedule) {
      console.log('start sorting data for daily schedule...');
      for (let schedule of this.dailySchedule) {

        for (let sdata of this.myData) {

          if (schedule.awayTeam.Name === sdata.team.Name) {
            sdata.player.gameTime = schedule.time;
            sdata.team.gameIce = schedule.location;
            sdata.team.gameId = schedule.id;
            sdata.player.gameLocation = "away";
            sdata.team.opponent = schedule.homeTeam.City + ' ' + schedule.homeTeam.Name;
            sdata.team.opponentId = schedule.homeTeam.ID;
            sdata.team.opponentCity = schedule.homeTeam.City;

          }
          if (schedule.homeTeam.Name === sdata.team.Name) {
            sdata.player.gameTime = schedule.time;
            sdata.team.gameIce = schedule.location;
            sdata.team.gameId = schedule.id;
            sdata.player.gameLocation = "home";
            sdata.team.opponent = schedule.awayTeam.City + ' ' + schedule.awayTeam.Name;
            sdata.team.opponentId = schedule.awayTeam.ID;
            sdata.team.opponentCity = schedule.awayTeam.City;
          }
        }
      }
    }

    if (this.myData && this.playerInfo && this.gamesToday === true) {
      console.log('start sorting data for starters...');
      for (let info of this.playerInfo) {

        for (let data of this.myData) {


          if (info.player.ID === data.player.ID) {

            data.player.image = info.player.officialImageSrc;

            //STAT-DATA IS CALLED IN THE HTML
            //this.statData = this.myData;

          }

        }
      }

    }

    if (this.myData && this.starterIdData && this.gamesToday === true) {
      console.log('start sorting data for starters...');
      for (let startid of this.starterIdData) {

        for (let startdata of this.myData) {

          if (startid === startdata.team.ID) {
            if (startdata.player.Position === "G" && startdata.stats.GamesPlayed['#text'] > 2) {
              startdata.player.startingToday = false;
              console.log(startdata.player.FirstName + " " + startdata.player.LastName, "this goalie is not starting yet. but he might start.");
              this.startersData.push(startdata);

            }
          } else if (startid === startdata.player.ID) {
            startdata.player.startingToday = true;
            //console.log(startdata, 'player data');
            this.startersData.push(startdata);
           
          }



          //STAT-DATA IS CALLED IN THE HTML
          //this.statData = this.myData;


        }
      }

         //MAKE MATCHUPS BY GAME ID OF STARTERS AND NON STARTERS
       this.statData = this.startersData.reduce(function(r, a) {
              r[a.team.gameId] = r[a.team.gameId] || [];

              r[a.team.gameId].push(a);
              return r

            }, Object.create(null));
            console.log(this.statData, 'made matchups of starting goalies by game ID...');
       
       this.showMatchups();
    

    }

  }

  showMatchups() {


      //THIS FOR LOOP GETS HOME STARTING HOCKEY GOALIES AND THERE STARTING OPPONENT 
      this.startersData.forEach((data) => {
        if (data.player.gameLocation === 'home') {
          data.team.matchup = this.statData[data.team.gameId];
          console.log(this.statData[data.team.gameId], 'show this');
          this.showData = this.startersData;
         
        }

      })
  }

  ngOnInit() {
    this.loadData()
  }
}
