import { Component, OnInit, Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TomorrowService } from '../tomorrow.service';
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
  selector: 'app-tomorrow-results',
  templateUrl: './tomorrow-results.component.html',
  styleUrls: ['./tomorrow-results.component.css']
})
export class TomorrowResultsComponent implements OnInit {

  starters: Array < any > ;
  dailySchedule: Array < any > ;
  fullSchedule: Array < any > ;
  starterIdData: Array < any > = [];
  startersData: Array < any > = [];
  myData: Array < any > ;
  showDataTomorrow: Array < any > ;
  sentDataTomorrow: Array < any > ;
  sentDataToday: Array < any > ;
  gameDate: string = '';
  defineToken: string = '';
  statData: Array < any > = [];
  playerInfo: Array < any > ;
  playerInjuries: Array < any > ;
  noGamesToday: boolean;
  gamesToday: boolean;
  twitterHandles: Array < any > ;
  tweetDay: any;
  noGamesMsg: any;
  selected: any;

  constructor(private http: Http, private tomorrowService: TomorrowService, private todayService: DataService, public snackBar: MatSnackBar, public router: Router, public dialog: MatDialog) {
    this.getJSON();
    yesterday = this.tomorrowService.getYesterday();
    tomorrow = this.tomorrowService.getTomorrow();
    today = this.tomorrowService.getToday();
    console.log(yesterday + ' yesterday, ' + today + ' today, ' + tomorrow + ' tomorrow, ');
    this.sentDataTomorrow = this.tomorrowService.getSentStats();
    this.sentDataToday = this.todayService.getSentStats();
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

    this.tomorrowService
      .getEnv().subscribe(res => {
        //this.defineToken = res._body;
        headers = new Headers({ "Authorization": "Basic " + btoa('ianposton' + ":" + res._body) });
        options = new RequestOptions({ headers: headers });
        this.tomorrowService
          .sendHeaderOptions(headers, options);

        this.tomorrowService
          .getDailySchedule().subscribe(res => {

            console.log(res, "schedule...");
            //console.log(tomorrowDailyDate, "get tomorrows schedule to find back to back games");
           


            if (res['dailygameschedule'].gameentry == null) {
              this.noGamesToday = true;
              this.noGamesMsg = "No Games Scheduled Tomorrow :("
              console.log('There are no games being played today.');
            } else {
              this.gamesToday = true;
               this.dailySchedule = res['dailygameschedule'].gameentry;
            this.gameDate = res['dailygameschedule'].gameentry[0].date;

            let dPipe = new DatePipe("en-US");
            this.tweetDay = dPipe.transform(this.gameDate, 'EEEE');

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

          this.tomorrowService
            .getInjured().subscribe(res => {
              console.log(res['playerinjuries'].playerentry, "injured players...");
              this.playerInjuries = res['playerinjuries'].playerentry;
          })

        this.tomorrowService
          .getInfo().subscribe(res => {
            console.log(res['activeplayers'].playerentry, "active players stats...");
            this.playerInfo = res['activeplayers'].playerentry;
          })

        this.tomorrowService
          .getGameId().subscribe(res => {
            console.log(res['fullgameschedule'].gameentry, "scheduled games for yesterday today and tomorrow...");
            this.fullSchedule = res['fullgameschedule'].gameentry;
          })

      })

  }

  sortData() {

    this.tomorrowService
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
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;
                sdata.team.day = this.tweetDay;
                sdata.player.injured = false;
                sdata.player.injury = '';
                sdata.player.playedYesterday = false;
                sdata.player.savesYesterday = '0';
                sdata.player.winsYesterday = '0';
                sdata.player.lossesYesterday = '0';
                sdata.player.saYesterday = '0';
                sdata.player.olYesterday = '0';
                sdata.player.shYesterday = '0';


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
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;
                sdata.team.day = this.tweetDay;
                sdata.player.injured = false;
                sdata.player.injury = '';
                sdata.player.playedYesterday = false;
                sdata.player.savesYesterday = '0';
                sdata.player.winsYesterday = '0';
                sdata.player.lossesYesterday = '0';
                sdata.player.saYesterday = '0';
                sdata.player.olYesterday = '0';
                sdata.player.shYesterday = '0';
              }
            }
          }
        }

        if (this.myData && this.fullSchedule) {
          console.log('start sorting data for full schedule...');
          for (let full of this.fullSchedule) {

            for (let btb of this.myData) {

              if (full.awayTeam.ID === btb.team.ID) {

                if (btb.team.yesterday === full.date) {

                  btb.team.hadGameYesterday = true;

                }
                if (btb.team.today === full.date) {
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {

                  btb.team.haveGameTomorrow = true;
                }

              }
              if (full.homeTeam.ID === btb.team.ID) {


                if (btb.team.yesterday === full.date) {

                  btb.team.hadGameYesterday = true;


                }
                if (btb.team.today === full.date) {
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {

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

              if (this.twitterHandles[data.team.ID][data.player.ID] != null) {
                data.player.atHandle = this.twitterHandles[data.team.ID][data.player.ID]+' ';
              } else {
                data.player.atHandle = '';
              }

              if (data.team.hadGameYesterday === true) {
                //console.log(data, 'game yesterday');
                if (data.team.haveGameToday === true) {
                  data.team.secondBacktoBack = "2nd game of Back-to-Back";
                } else {
                  data.team.secondBacktoBack = "";
                }
              } else {
                data.team.secondBacktoBack = "";
              }

              if (data.team.haveGameToday === true) {
                //console.log(data, 'game today');
                if (data.team.haveGameTomorrow === true) {
                  data.team.firstBacktoBack = "1st game of Back-to-Back";
                } else {
                  data.team.firstBacktoBack = "";
                }
              }


            }

          }
        }

        if (this.sentDataToday != null) {
            console.log('start sorting data from yesterday...');
            for (let today of this.sentDataToday) {

              for (let tomdata of this.myData) {

                if (today.player.saves > 1 && today.player.ID === tomdata.player.ID) {
                  
                    tomdata.player.finishedYesterday = false;
                    tomdata.player.playedYesterday = true;
                    tomdata.player.savesYesterday = today.player.saves;
                    tomdata.player.winsYesterday = today.player.wins;
                    tomdata.player.lossesYesterday = today.player.losses;
                    tomdata.player.saYesterday = today.player.shotsFaced;
                    tomdata.player.olYesterday = today.player.OvertimeLosses;
                    tomdata.player.shYesterday = today.player.Shutouts;
                  if (today.player.wins == '1') {
                    tomdata.player.resultYesterday = today.player.FirstName +' '+ today.player.LastName + ' got the Win tonight with ' + today.player.saves + ' saves against ' + today.player.shotsFaced + ' shots.'
                   } else if (today.player.losses == '1' || today.player.OvertimeLosses == '1') {
                    tomdata.player.resultYesterday = today.player.FirstName +' '+ today.player.LastName + ' got the Loss tonight with ' + today.player.saves + ' saves against ' + today.player.shotsFaced + ' shots.'
                   }
                  
                } 

              }
            }
          }

        if (this.playerInjuries.length > 0) {
            console.log('start sorting data for starters matchups...');
            for (let inj of this.playerInjuries) {

              for (let injdata of this.myData) {

                if (inj.player.ID === injdata.player.ID) {
                  //console.log(inj.injury, "injuries...");

                    injdata.player.injured = true;
                    injdata.player.injury = ' '+inj.injury;
                    
                    if (inj.injury.substr(inj.injury.length - 5) === '(Out)') {
                      console.log(inj.injury.substr(inj.injury.length - 5), 'injuries that say OUT!');
                       injdata.player.injuryOut = true;
                    } 
                    
                } 

              }
            }
          }



        if (this.myData && this.gamesToday === true) {

          if (this.starterIdData.length > 0) {
            console.log('start sorting data for starters matchups...');
            for (let startid of this.starterIdData) {

              for (let startdata of this.myData) {

                if (startid === startdata.team.ID) {
                  if (startdata.stats.GamesPlayed['#text'] > 5 && startdata.player.injuryOut == null && startdata.player.ID != '9072' && startdata.player.ID != '5518' && startdata.player.ID != '5296') {
//&&  startdata.player.winsYesterday == '0' && startdata.player.lossesYesterday == '0' && startdata.player.olYesterday == '0'
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
        console.log(this.statData[data.team.gameId], 'show this');
        this.statData[data.team.gameId][0].player.twoPossibleStarters = false;
        this.statData[data.team.gameId][1].player.twoPossibleStarters = false;

        if (this.statData[data.team.gameId].length > 2) {
          //console.log(this.statData[data.team.gameId][0].team.Name + ' ' + this.statData[data.team.gameId][1].team.Name + ' ' + this.statData[data.team.gameId][2].team.Name, 'possible starters...');
          if (this.statData[data.team.gameId][0].team.ID === this.statData[data.team.gameId][1].team.ID) {
            this.statData[data.team.gameId][1].twoPossibleStarters = true;
            if (this.statData[data.team.gameId][0].player.resultYesterday != null) {
              this.statData[data.team.gameId][0].player.finishedYesterday = true;
            } 
            if (this.statData[data.team.gameId][1].player.resultYesterday != null) {
              this.statData[data.team.gameId][1].player.finishedYesterday = true;
            }
          } else {
            this.statData[data.team.gameId][1].twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][1].team.ID === this.statData[data.team.gameId][2].team.ID) {
            this.statData[data.team.gameId][1].twoPossibleStarters = true;
            
            
            this.statData[data.team.gameId][2].player.twoPossibleStarters = true;
              if (this.statData[data.team.gameId][2].player.resultYesterday != null) {
              this.statData[data.team.gameId][2].player.finishedYesterday = true;
            } 
            if (this.statData[data.team.gameId][1].player.resultYesterday != null) {
              this.statData[data.team.gameId][1].player.finishedYesterday = true;
            }
          } else {
            // this.statData[data.team.gameId][1].twoPossibleStarters = false;
            this.statData[data.team.gameId][2].player.twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][3] != null) {
            if (this.statData[data.team.gameId][2].team.ID === this.statData[data.team.gameId][3].team.ID) {
              this.statData[data.team.gameId][2].twoPossibleStarters = true;
              this.statData[data.team.gameId][3].twoPossibleStarters = true;
                if (this.statData[data.team.gameId][2].player.resultYesterday != null) {
              this.statData[data.team.gameId][2].player.finishedYesterday = true;
            } 
            if (this.statData[data.team.gameId][3].player.resultYesterday != null) {
              this.statData[data.team.gameId][3].player.finishedYesterday = true;
            }
            } else {
              this.statData[data.team.gameId][2].twoPossibleStarters = false;
              this.statData[data.team.gameId][3].twoPossibleStarters = false;
            }
          }

        }



        this.showDataTomorrow = this.startersData;


      }

    })

    this.tomorrowService
      .sendStats(this.showDataTomorrow);
  }

  ngOnInit() {
    if (this.sentDataTomorrow === undefined) {
      this.loadData();

    } else {
      setInterval(() => {
        this.showDataTomorrow = this.sentDataTomorrow;
        //console.log(this.showDataTomorrow["0"].team.today, "get the date");
        this.gameDate = this.showDataTomorrow["0"].team.today;
      }, 300)

    }

  }

   public isVisibleOnDesktop() {
    // console.log('width over 600px');
  }

  openSnackBar() {
    this.snackBar.openFromComponent(InfoTomorrow, {
      // duration: 500,
    });
  }

  public goToday() {
    this.router.navigateByUrl('starting-goalies');
  }

   public open(event, data) {
    this.selected = data;
    console.log(data, 'ok you clicked on player img...');
    this.dialog.open(TomorrowDialog, {
      data: data,
      width: '600px',
    });
  }


}

@Component({
  selector: 'tomorrow-dialog',
  template: `<i (click)="dialogRef.close()" style="float:right; cursor:pointer;" class="material-icons">close</i>
  <span style="color:#00aced;">Twitter Updates!</span> 
  <mat-dialog-content>
  <span style="font-size: 26px; font-weight: light; color: #555; text-align: center;">{{ noPosts }}</span>
  <ul *ngFor="let item of tweetsData" style="font-size:14px">
    <li>{{item.text}} <span style="color:#6740B4; font-weight: bold;">{{item.created_at | date:'fullDate'}}</span></li>
</ul>
</mat-dialog-content>`,
})

export class TomorrowDialog implements OnInit {
  test: any;
  noPosts: any;
  tweetsData: Array < any > ;
  constructor(public dialogRef: MatDialogRef < TomorrowDialog > , @Inject(MAT_DIALOG_DATA) public data: any, private http: Http) {

  }

  loadStuff() {
    let headers = new Headers();

    headers.append('Content-Type', 'application/X-www-form-urlencoded');

    this.http.post('/authorize', { headers: headers }).subscribe((res) => {
      this.searchCall();
    })


  }


  searchCall() {
    console.log(this.data, 'data passed in')
  
    let headers = new Headers();
    let searchterm = 'query=#startingGoalies #nhl ' + this.data.player.FirstName + ' ' + this.data.player.LastName;
    //let searchterm = 'query=#FantasyHockey ' + this.data.player.twitterHandle;

    headers.append('Content-Type', 'application/X-www-form-urlencoded');

    this.http.post('/search', searchterm, { headers: headers }).subscribe((res) => {
      console.log(res.json().data.statuses, 'twitter stuff');
      this.tweetsData = res.json().data.statuses;
      if (this.tweetsData.length === 0) {
        this.noPosts = "No Tweets.";
      }
    });
  }

  ngOnInit() {
    this.loadStuff();
  }
}

@Component({
  selector: 'info-tomorrow',
  template: `<i (click)="close()" class="material-icons close">close</i><br />
<span style="color: #e74c3c;">back</span><span style="color: #ccc;"> to back</span><span> = The first game of a back to back scheduled game.</span><br />
<span style="color: #ccc;">back to </span><span style="color: #e74c3c;">back</span><span> = The second game of a back to back scheduled game.</span> <br />
<span>Click on player image for twitter updates!</span>`,
  styles: [`.close { float:right; cursor:pointer; font-size: 20px;}`]
})

export class InfoTomorrow {
  constructor(public snackBar: MatSnackBar) {}
  close() {
    this.snackBar.dismiss();
  }
}
