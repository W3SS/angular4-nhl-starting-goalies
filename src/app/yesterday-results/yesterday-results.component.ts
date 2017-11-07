import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { YesterdayService } from '../yesterday.service';
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
  selector: 'app-yesterday-results',
  templateUrl: './yesterday-results.component.html',
  styleUrls: ['./yesterday-results.component.css']
})
export class YesterdayResultsComponent implements OnInit {

  starters: Array < any > ;
  score: Array < any > ;
  dailySchedule: Array < any > ;
  fullSchedule: Array < any > ;
  starterIdData: Array < any > = [];
  starterStatData: Array < any > = [];
  startersData: Array < any > = [];
  myData: Array < any > ;
  showDataYesterday: Array < any > ;
  sentYesterdayData: Array < any > ;
  gameDate: string = '';
  defineToken: string = '';
  statData: Array < any > = [];
  playerInfo: Array < any > ;
  noGamesToday: boolean;
  gamesToday: boolean;
  twitterHandles: Array < any > ;


  constructor(private http: Http, private yesterdayService: YesterdayService, public snackBar: MatSnackBar, public router: Router) {
    this.getJSON();
    yesterday = this.yesterdayService.getYesterday();
    tomorrow = this.yesterdayService.getTomorrow();
    today = this.yesterdayService.getToday();
    console.log(yesterday + ' yesterday, ' + today +' today, ' + tomorrow +' tomorrow, ');
    this.sentYesterdayData = this.yesterdayService.getSentStats();

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

    this.yesterdayService
      .getEnv().subscribe(res => {
        //this.defineToken = res._body;
        headers = new Headers({ "Authorization": "Basic " + btoa('ianposton' + ":" + res._body) });
        options = new RequestOptions({ headers: headers });
        this.yesterdayService
          .sendHeaderOptions(headers, options);

        this.yesterdayService
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
                    this.http.get('https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/game_boxscore.json?gameid='+g.id+'&playerstats=Sv,GA,GAA,GS,SO,MIN,W,L,SA,OTL,OTW', options)
                    .map(response => response.json())
                  )
                )
                .subscribe(res => {
                  console.log(res, 'making several calls by GAME ID for starting lineups...');

                  let i;
                  let i2;
                  let i3;
                  let res2;
                  let res3;
                  res.forEach((item, index) => {
                    i = index;
                    //console.log(res[i]['gameboxscore'].awayTeam.awayPlayers['playerEntry'], 'got box score data for away team!');
                    //console.log(res[i]['gameboxscore'].homeTeam.homePlayers['playerEntry'], 'got box score data for home team!');
                    res2 = res[i]['gameboxscore'].awayTeam.awayPlayers['playerEntry'];
                    res3 = res[i]['gameboxscore'].homeTeam.homePlayers['playerEntry'];
                    //this.gameTime =  res[i]['gamestartinglineup'].game.date;
                    res2.forEach((item, index) => {

                      i2 = index;
                      if (res2[i2].stats != null) {
                        this.starterStatData.push(res2[i2]);
                        //console.log(res2[i2].actual.starter[0].player.ID, 'got player ID for goalie actualy starting!');
                        this.starterIdData.push(res2[i2].player.ID);

                      } 


                    });
                    res3.forEach((item, index) => {

                      i3 = index;
                      if (res3[i3].stats != null) {
                        this.starterStatData.push(res3[i3]);
                        //console.log(res2[i2].actual.starter[0].player.ID, 'got player ID for goalie actualy starting!');
                        this.starterIdData.push(res3[i3].player.ID);

                      } 

                    });
                  });

                  this.sortData();

                });

            }

          })

          // TO GET ACTUAL STARTER OF GAME CHECK FOR PLAYER.STATS.SAVES > 0 BY GAMEID. ITS THE ONLY WAY TO BE SURE. 
          
      this.yesterdayService
        .getScore().subscribe(res => {
          console.log(res['scoreboard'].gameScore, "Score...");
          this.score = res['scoreboard'].gameScore;
        })

        this.yesterdayService
          .getInfo().subscribe(res => {
            console.log(res['activeplayers'].playerentry, "active players stats...");
            this.playerInfo = res['activeplayers'].playerentry;
         })

        this.yesterdayService
          .getGameId().subscribe(res => {
            console.log(res['fullgameschedule'].gameentry, "scheduled games for yesterday today and tomorrow...");
            this.fullSchedule = res['fullgameschedule'].gameentry;
          })

      })

  }



  sortData() {
    
    this.yesterdayService
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

          console.log('start sorting data for starters stats Saves...');
          for (let statinfo of this.starterStatData) {

            for (let maindata of this.myData) {


              if (statinfo.player.ID === maindata.player.ID) {
                //console.log(statinfo, "stats for starters");
                maindata.player.saves = statinfo.stats.Saves['#text'];
                maindata.player.wins = statinfo.stats.Wins['#text'];
                maindata.player.losses = statinfo.stats.Losses['#text'];
                maindata.player.GamesStarted = statinfo.stats.GamesStarted['#text'];
                maindata.player.GoalsAgainstAverage = statinfo.stats.GoalsAgainstAverage['#text'];
                maindata.player.MinutesPlayed = statinfo.stats.MinutesPlayed['#text'];
                maindata.player.Shutouts = statinfo.stats.Shutouts['#text'];
                maindata.player.ShotsAgainst = statinfo.stats.ShotsAgainst['#text'];
                maindata.player.OvertimeLosses = statinfo.stats.OvertimeLosses['#text'];
                maindata.player.OvertimeWins = statinfo.stats.OvertimeWins['#text'];

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
              if (startid === startdata.player.ID && startdata.player.saves > 0) {
                  startdata.player.startingToday = true;
                  startdata.player.subedInToday = false;
                  //console.log(startdata, 'player data');
                  this.startersData.push(startdata);

                } 

                // else if (startid === startdata.player.ID && startdata.player.GamesStarted == '0') {
                //   startdata.player.subedInToday = true;
                //   startdata.player.startingToday = false;
                //   this.startersData.push(startdata);

                // }

              }
            }
          }

          if (this.myData && this.score) {
            console.log('start sorting data for scoreboard stats...');
            for (let sc of this.score) {
              for (let pdata of this.myData) {
                     
                if (sc.game.awayTeam.ID === pdata.team.ID) {

                  //console.log(sc, 'score items');
                  pdata.team.awayGoalie = pdata.player.FirstName + ' ' + pdata.player.LastName;
                  pdata.team.opponentAbbreviation = sc.game.homeTeam.Abbreviation;
                  pdata.team.teamScore = sc.awayScore;
                  pdata.team.opponentScore = sc.homeScore; 

                }
                if (sc.game.homeTeam.ID === pdata.team.ID) {

                  pdata.team.homeGoalie = pdata.player.FirstName + ' ' + pdata.player.LastName;
                  pdata.team.opponentAbbreviation = sc.game.awayTeam.Abbreviation;
                  pdata.team.opponentScore = sc.awayScore;
                  pdata.team.teamScore = sc.homeScore; 

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
        

        this.showDataYesterday = this.startersData;
        

      }

    })

    this.yesterdayService
              .sendStats(this.showDataYesterday);
  }

  ngOnInit() {
     if (this.sentYesterdayData === undefined) {
      this.loadData();
      
    } else {
       setInterval(() => {
        this.showDataYesterday = this.sentYesterdayData;
        //console.log(this.showDataYesterday["0"].team.today, "get the date");
        this.gameDate = this.showDataYesterday["0"].team.today;
      }, 300)
      

    }
  }

  public goToday() {
    this.router.navigateByUrl('starting-goalies');
  }

  openSnackBar() {
    this.snackBar.openFromComponent(InfoYesterday, {
      // duration: 500,
    });
  }

}

@Component({
  selector: 'info-yesterday',
  template: `<i (click)="close()" class="material-icons close">close</i><br />
<span style="color: #e74c3c;">back</span><span style="color: #ccc;"> to back</span><span> = The first game of a back to back scheduled game.</span><br />
<span style="color: #ccc;">back to </span><span style="color: #e74c3c;">back</span><span> = The second game of a back to back scheduled game.</span>`,
  styles: [`.close { float:right; cursor:pointer; font-size: 20px;}`]
})

export class InfoYesterday {
  constructor(public snackBar: MatSnackBar) {}
  close() {
    this.snackBar.dismiss();
  }
}
