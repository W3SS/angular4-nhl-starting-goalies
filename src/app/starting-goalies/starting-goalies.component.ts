import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataService } from '../data.service';
import { MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

//DATE FORMAT FOR FULL SCHEDULE API COMPARE DATES FOR BACK TO BACK
let today = null;
let tomorrow = null;
let yesterday = null;

let headers = null;
let options = null;


@Component({
  selector: 'app-starting-goalies',
  templateUrl: './starting-goalies.component.html',
  styleUrls: ['./starting-goalies.component.css']
})
export class StartingGoaliesComponent implements OnInit {

  starters: Array < any > ;
  dailySchedule: Array < any > ;
  fullSchedule: Array < any > ;
  starterIdData: Array < any > = [];
  startersData: Array < any > = [];
  myData: Array < any > ;
  showData: Array < any > ;
  sentData: Array < any > ;
  gameDate: string = '';
  defineToken: string = '';
  statData: Array < any > = [];
  playerInfo: Array < any > ;
  noGamesToday: boolean;
  gamesToday: boolean;
  twitterHandles: Array < any >;
  selected: any;
  test: any;


  constructor(private http: Http, private dataService: DataService, public snackBar: MatSnackBar, public router: Router, public dialog: MatDialog) {
   
    yesterday = this.dataService.getYesterday();
    tomorrow = this.dataService.getTomorrow();
    today = this.dataService.getToday();
    console.log(yesterday + ' yesterday, ' + today +' today, ' + tomorrow +' tomorrow, ');
    this.sentData = this.dataService.getSentStats();
  }

   public getJSON() {
         this.http.get("./assets/twitter.json")
           .map(response => response.json())
           .subscribe(res => {
      console.log(res['twitterHandles']["0"], 'twitter handles');
      this.twitterHandles = res['twitterHandles']["0"];
    })                     

     }

  loadData() {

    this.dataService
      .getEnv().subscribe(res => {
        //this.defineToken = res._body;
        headers = new Headers({ "Authorization": "Basic " + btoa('ianposton' + ":" + res._body) });
        options = new RequestOptions({ headers: headers });
        this.dataService
          .sendHeaderOptions(headers, options);

        this.dataService
          .getDailySchedule().subscribe(res => {

            console.log(res, "schedule...");
            //console.log(tomorrowDailyDate, "get tomorrows schedule to find back to back games");
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
                    //console.log(res[i]['gamestartinglineup'].teamLineup, 'got starting lineups data!');
                    res2 = res[i]['gamestartinglineup'].teamLineup;
                    //this.gameTime =  res[i]['gamestartinglineup'].game.date;
                    res2.forEach((item, index) => {

                      i2 = index;
                      if (res2[i2].actual != null && res2[i2].expected != null) {
                        //console.log(res2[i2].actual.starter[0].player.ID, 'got player ID for goalie actualy starting!');
                        this.starterIdData.push(res2[i2].actual.starter[0].player.ID);

                      } else if (res2[i2].actual == null && res2[i2].expected != null) {
                        //console.log(res2[i2].expected.starter[0].player.ID, 'got player ID for goalie expected to start!');
                        this.starterIdData.push(res2[i2].expected.starter[0].player.ID);
                      } else {
                        //console.log(res2[i2].team.City + " " + res2[i2].team.Name, 'no starters yet!');
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

        this.dataService
          .getInfo().subscribe(res => {
            console.log(res['activeplayers'].playerentry, "active players stats...");
            this.playerInfo = res['activeplayers'].playerentry;
         })

        this.dataService
          .getGameId().subscribe(res => {
            console.log(res['fullgameschedule'].gameentry, "scheduled games for yesterday today and tomorrow...");
            this.fullSchedule = res['fullgameschedule'].gameentry;
          })

      })

  }



  sortData() {
    
    this.dataService
      .getStats().subscribe(res => {
        console.log(res['cumulativeplayerstats'].playerstatsentry, "cumulative stats...");
        this.myData = res['cumulativeplayerstats'].playerstatsentry;
      
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
                sdata.team.opponentName = schedule.homeTeam.Name;
                sdata.team.opponentAbbreviation = schedule.homeTeam.Abbreviation;
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;

              }
              if (schedule.homeTeam.Name === sdata.team.Name) {
                sdata.player.gameTime = schedule.time;
                sdata.team.gameIce = schedule.location;
                sdata.team.gameId = schedule.id;
                sdata.player.gameLocation = "home";
                sdata.team.opponent = schedule.awayTeam.City + ' ' + schedule.awayTeam.Name;
                sdata.team.opponentId = schedule.awayTeam.ID;
                sdata.team.opponentCity = schedule.awayTeam.City;
                sdata.team.opponentName = schedule.awayTeam.Name;
                sdata.team.opponentAbbreviation = schedule.awayTeam.Abbreviation;
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;
              }
            }
          }
        }

        if (this.myData && this.fullSchedule) {
          console.log('start sorting data for full schedule...');
          for (let full of this.fullSchedule) {

            for (let btb of this.myData) {

              if (full.awayTeam.ID === btb.team.ID) {
                //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that match ID away');
                //console.log(full.date + ' ' + full.homeTeam.Name + ' ' + today, 'teams that match ID home');

                if (btb.team.yesterday === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that had a game yesterday');
                  btb.team.hadGameYesterday = true;


                }
                if (btb.team.today === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that have a game today');
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that have a game tomorrow');
                  btb.team.haveGameTomorrow = true;
                }

              }
               if (full.homeTeam.ID === btb.team.ID) {
                //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that match ID away');
                //console.log(full.date + ' ' + full.homeTeam.Name + ' ' + today, 'teams that match ID home');

                if (btb.team.yesterday === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that had a game yesterday');
                  btb.team.hadGameYesterday = true;


                }
                if (btb.team.today === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that have a game today');
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {
                  //console.log(full.date + ' ' + full.awayTeam.Name + ' ' + today, 'teams that have a game tomorrow');
                  btb.team.haveGameTomorrow = true;
                }

              }
            }
          }
        }

       


    
          console.log('start sorting data for starters...');
          for (let info of this.playerInfo) {

            for (let data of this.myData) {


              if (info.player.ID === data.player.ID) {

                data.player.image = info.player.officialImageSrc;
                data.player.twitterHandle = this.twitterHandles[data.team.ID].twitterHashTag;

              }

            }
          }

      

        if (this.myData && this.gamesToday === true) {
          if (this.starterIdData.length > 0) {
            console.log('start sorting data for starters matchups...');
            for (let startid of this.starterIdData) {

              for (let startdata of this.myData) {

                if (startid === startdata.team.ID) {
                  if (startdata.stats.GamesPlayed['#text'] > 3) {

                    startdata.player.startingToday = false;
                    startdata.player.likelyStartingToday = true;
                    //console.log(startdata.player.FirstName + " " + startdata.player.LastName, "this goalie is not starting yet. but he might start.");
                    this.startersData.push(startdata);


                  }
                } else if (startid === startdata.player.ID) {
                  startdata.player.startingToday = true;
                  //console.log(startdata, 'player data');
                  this.startersData.push(startdata);

                }

              }
            }
          }


          //MAKE MATCHUPS BY GAME ID OF STARTERS AND NON STARTERS
          if (this.startersData.length > 0) {
            this.statData = this.startersData.reduce(function(r, a) {
              r[a.team.gameId] = r[a.team.gameId] || [];

              r[a.team.gameId].push(a);
              return r

            }, Object.create(null));

            //console.log(this.statData, 'made matchups of starting goalies by game ID...');

            this.showMatchups();
          }

        }

      })

  }

  showMatchups() {


    //THIS FOR LOOP GETS HOME STARTING HOCKEY GOALIES AND THERE STARTING OPPONENT 
    this.startersData.forEach((data) => {
      if (data.player.gameLocation === 'home') {
        data.team.matchup = this.statData[data.team.gameId];
        //console.log(this.statData[data.team.gameId], 'show this');
        this.statData[data.team.gameId][0].player.twoPossibleStarters = false;
        this.statData[data.team.gameId][1].player.twoPossibleStarters = false;

        if (this.statData[data.team.gameId].length > 2) {
          //console.log(this.statData[data.team.gameId][0].team.Name + ' ' + this.statData[data.team.gameId][1].team.Name + ' ' + this.statData[data.team.gameId][2].team.Name, 'possible starters...');
          if (this.statData[data.team.gameId][0].team.ID === this.statData[data.team.gameId][1].team.ID) {
            this.statData[data.team.gameId][1].twoPossibleStarters = true;
          } else {
            this.statData[data.team.gameId][1].twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][1].team.ID === this.statData[data.team.gameId][2].team.ID) {
            // this.statData[data.team.gameId][1].twoPossibleStarters = true;
            this.statData[data.team.gameId][2].player.twoPossibleStarters = true;
          } else {
            // this.statData[data.team.gameId][1].twoPossibleStarters = false;
            this.statData[data.team.gameId][2].player.twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][3] != null) {
            if (this.statData[data.team.gameId][2].team.ID === this.statData[data.team.gameId][3].team.ID) {
              this.statData[data.team.gameId][2].twoPossibleStarters = true;
              this.statData[data.team.gameId][3].twoPossibleStarters = true;
            } else {
              this.statData[data.team.gameId][2].twoPossibleStarters = false;
              this.statData[data.team.gameId][3].twoPossibleStarters = false;
            }
          }

        }

          

        this.showData = this.startersData;
        

      }

    })

    this.dataService
              .sendStats(this.showData);
  }

  ngOnInit() {
     if (this.sentData === undefined) {
      this.getJSON();
      this.loadData();
      
    } else {
       this.getJSON();
       setInterval(() => {
        this.showData = this.sentData;
        //console.log(this.showData["0"].team.today, "get the date");
        this.gameDate = this.showData["0"].team.today;
      }, 300)
      
    }
    
  }

   public open(event, data) {
    this.selected = data;
    console.log(data, 'ok you clicked on player img...');
    this.dialog.open(TodayDialog, {
      data: data,
      width: '600px',
    });
  }

  openSnackBar() {
    this.snackBar.openFromComponent(Info, {
      // duration: 500,
    });
  }

  public goYesterday() {
    this.router.navigateByUrl('starting-goalies/yesterday');
  }

   public goTomorrow() {
    this.router.navigateByUrl('starting-goalies/tomorrow');
  }

}

@Component({
  selector: 'today-dialog',
  template: `<i (click)="dialogRef.close()" style="float:right; cursor:pointer;" class="material-icons">close</i>
  <span style="color:#00aced;">Twitter Updates!</span> 
  <mat-dialog-content>
  <span style="font-size: 26px; font-weight: light; color: #555; text-align: center;">{{ noPosts }}</span>
  <ul *ngFor="let item of tweetsData" style="font-size:14px">
    <li>{{item.text}}</li>
</ul>
</mat-dialog-content>`,
})

export class TodayDialog implements OnInit{
  test: any;
  noPosts: any;
  tweetsData: Array < any >;
  constructor(public dialogRef: MatDialogRef < TodayDialog > , @Inject(MAT_DIALOG_DATA) public data: any, private http: Http) {
    
  }

  loadStuff() {
     let headers = new Headers();
    
    headers.append('Content-Type', 'application/X-www-form-urlencoded');
    
    this.http.post('/authorize', {headers: headers}).subscribe((res) => {
      console.log(res, 'twitter res');
      this.searchCall();
    })
 

  }


searchCall(){
  console.log(this.data, 'data passed in')
    let AND;
    let headers = new Headers();
    let searchterm = 'query='+this.data.player.twitterHandle+' #startingGoalies'; 
    
    headers.append('Content-Type', 'application/X-www-form-urlencoded');
    
    this.http.post('/search', searchterm, {headers: headers}).subscribe((res) => {
      console.log(res.json().data.statuses, 'twitter stuff');
      this.tweetsData = res.json().data.statuses;
      if (this.tweetsData.length === 0) {
        this.noPosts = "No Posts Yet.";
      }
    });
  }

  ngOnInit() {
     this.loadStuff();
   }
}

@Component({
  selector: 'info',
  template: `<i (click)="close()" class="material-icons close">close</i><br />
<span style="color: #e74c3c;">back</span><span style="color: #ccc;"> to back</span><span> = The first game of a back to back scheduled game.</span><br />
<span style="color: #ccc;">back to </span><span style="color: #e74c3c;">back</span><span> = The second game of a back to back scheduled game.</span> <br />
<span>Click on player image for twitter updates!</span>`,
  styles: [`.close { float:right; cursor:pointer; font-size: 20px; }`]
})

export class Info {
  constructor(public snackBar: MatSnackBar) {}
  close() {
    this.snackBar.dismiss();
  }
}
