import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Injectable()
export class FirebaseService {

  items: any;
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(public af: AngularFireDatabase, private firebaseAuth: AngularFireAuth) {
    this.items = af.list('/Starters').valueChanges(); 
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

 isLoggedIn() {
  if (this.userDetails == null ) {
      console.log("this.userDetails are null");
      return false;
    } else {
      //console.log(this.userDetails, "this.userDetails is true and logged in...");
      return true;
    }
  }

  logout() {
    this.firebaseAuth.auth.signOut();
  }

   addData(starters) {
      console.log(starters, 'starters.json in fb service...');
      console.log('deleting data from fb...');
      this.af.list('/Starters').remove().then(_ => {
        console.log('deleted!');
        this.getStarterData();
      });
      console.log('saving new data to fb...');
      this.af.list('/Starters').push(starters); 
  }

  getStarterData() {
    console.log('getting starter data from firebase...');
    return this.items = this.af.list('/Starters').valueChanges();
  }
}
 