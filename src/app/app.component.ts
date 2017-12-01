import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  navLinks: Array < any > ;
  constructor(public http: Http){}
  public getJSON() {
         this.http.get("./assets/routerlinks.json")
           .map(response => response.json())
           .subscribe(res => {
      console.log(res['navLinks'], 'nav links');
      this.navLinks = res['navLinks'];
    }) 
  }

   ngOnInit() {
     this.getJSON();
    
  }

   public isVisibleOnMobile() {
    // console.log('width under 600px');
  }

  public isVisibleOnDesktop() {
    // console.log('width over 600px');
  }

  //position for tooltip
  position = 'above';


}





