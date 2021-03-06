import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

let testDate = new Date();
let thisDate = new Date(testDate.getTime() + (24 * 60 * 60 * 1000));
let tomorrowDate = new Date(thisDate.getTime() + (24 * 60 * 60 * 1000));
let yesterdayDate = new Date(thisDate.getTime() - (24 * 60 * 60 * 1000));

let utcDate = new Date(thisDate.toUTCString());
let tomorrowUtcDate = new Date(tomorrowDate.toUTCString());
let yesterdayUtcDate = new Date(yesterdayDate.toUTCString());

utcDate.setHours(utcDate.getHours() - 8);
tomorrowUtcDate.setHours(tomorrowUtcDate.getHours() - 8);
yesterdayUtcDate.setHours(yesterdayUtcDate.getHours() - 8);


let myDate = new Date(utcDate);
let tomorrowMyDate = new Date(tomorrowUtcDate);
let yesterdayMyDate = new Date(yesterdayUtcDate);

//DATE FORMAT FOR DAILY SCHEDULE API
let dailyDate = myDate.toISOString().slice(0, 10).replace(/-/g, "");
let tomorrowDailyDate = tomorrowMyDate.toISOString().slice(0, 10).replace(/-/g, "");
let yesterdayDailyDate = yesterdayMyDate.toISOString().slice(0, 10).replace(/-/g, "");

//DATE FORMAT FOR FULL SCHEDULE API COMPARE DATES FOR BACK TO BACK
let today = myDate.toISOString().slice(0, 10);
let tomorrow = tomorrowMyDate.toISOString().slice(0, 10);
let yesterday = yesterdayMyDate.toISOString().slice(0, 10);

let headers = null;

let sendingTomorrow;
let sentTomorrow;

@Injectable()
export class TomorrowService {

  info: Observable < any > = null;
  stats: Observable < any > = null;
  env: Observable < any > = null;
  gameid: Observable < any > = null;
  daily: Observable < any > = null;
  schedule: Observable < any > = null;
  score: Observable < any > = null;
  play: Observable <any> = null;
  injured: Observable <any> = null;

  apiRoot: string = "https://api.mysportsfeeds.com/v1.2/pull/nhl/2018-playoff";

  constructor(private http: HttpClient) {}

  sendHeaderOptions(h) {
    console.log('got headers & options in data service...');
    headers = h;
  }


  getDailySchedule() {
    
    if (!this.schedule) {
      console.log('getting schedule data from API...');

      let url = `${this.apiRoot}/daily_game_schedule.json?fordate=`+dailyDate;
      this.schedule = this.http.get(url, {headers})
        
    }
    return this.schedule;

  }


  getEnv() {
    console.log("trying to get heroku env...");
    this.env = this.http.get('/heroku-env')
    return this.env;
  }

  getYesterday() {
    console.log("send yesterday..."); 
    return yesterday; 
  }

  getToday() {
    console.log("send today..."); 
    return today; 
  }

  getTomorrow() {
    console.log("send tomrrow..."); 
    return tomorrow; 
  }

  sendStats(statsArray) {
    console.log("sending stats to service...");
    sendingTomorrow = statsArray;
  }

  getSentStats() {
    console.log("stats sent to component...");
    sentTomorrow = sendingTomorrow;
    return sentTomorrow;
  }


  getInfo() {

    if (!this.info) {

      let url = `${this.apiRoot}/active_players.json?position=G`;
      console.log('getting active player data from API...');
      this.info = this.http.get(url, {headers})
        
    }
    return this.info;
  }

  getStats(teams) {
    if (!this.stats) {
      console.log('getting cumulative player stats from API...');

      let url = `${this.apiRoot}/cumulative_player_stats.json?position=G&team=`+teams;
      this.stats = this.http.get(url, {headers})
        
    }
    return this.stats;
  }

  getGameId() {

    if (!this.gameid) {
      console.log('getting yesterday, today, tomorrow from API...');

      let url = `${this.apiRoot}/full_game_schedule.json?date=from-`+yesterdayDailyDate+`-to-`+tomorrowDailyDate;
      this.gameid = this.http.get(url, {headers})
        
    }
    return this.gameid;
  }

  getInjured() {

    if (!this.injured) {
      console.log('getting yesterday, today, tomorrow from API...');

      let url = `${this.apiRoot}/player_injuries.json?position=G`;
      this.injured = this.http.get(url, {headers})
        
    }
    return this.injured;
  }



  clearCache() {
    //this.info = null;
  }

}
