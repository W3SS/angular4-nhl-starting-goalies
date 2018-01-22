import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Injectable()
export class FirebaseService {

  items:FirebaseListObservable<any[]>;

  constructor(public af: AngularFireDatabase) {
    this.items = af.list('/Starters'); 
  }

  getStarterData() {
    console.log('getting starter data from firebase...');
    return this.items = this.af.list('/Starters');
  }
}
 