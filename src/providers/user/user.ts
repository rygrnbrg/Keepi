import { Injectable } from '@angular/core';
import { AuthProvider } from '../auth/auth';
import { AuthenticationData } from '../../models/authentication';
import * as firebase from 'firebase/app';

export interface UserData {
  id: string;
  email: string;
  areas: Area[];
}

export interface UserSetting {
  name: string;
}

export interface Area extends UserSetting {
 
}

@Injectable()
export class User {
  private _user: firebase.User;
  private _areasRef : any;
  private _areas : Area[];
  private defaultAreasInitiated = false;
  
  constructor(
    private authProvider: AuthProvider) {
      firebase.auth().onAuthStateChanged(user => this.initUser(user));
  }

  public login(data: AuthenticationData): Promise<any> {
    return this.authProvider.doLogin(data).then(
      res => {
      this.initUser(res);
      },
      err => {
        return Promise.reject(err);
      }
    );
  }

  public loginExistingUser(user: firebase.User): void {
    if (user) {
      this._user = user;
      console.log('Logged in existing user');
    }

  }

  public signup(data: AuthenticationData) {
    return this.authProvider.doRegister(data);
  }

  public resetPassword(email: string) {
    return this.authProvider.doSendPasswordResetEmail(email);
  }

  public sendVerificationEmail() {
    return this.authProvider.doSendVerificationEmail();
  }

  public getUserData(): UserData {
    if (!this._user){
      return null;
    }
    
    return {
      id: this._user.uid,
      email: this._user.email,
      areas: this._areas
    };
  }

  public logout() {
    this.authProvider.doLogout().then(this._user = null);
  }

  private initUser(user: firebase.User): Promise<void> {
    this._user = user;
    return this.initAreas();
  }

  private initAreas(): Promise<void>{
    if (!this._user){
      return Promise.resolve();
    }


    this._areas = [];
    let areasCollectionRef = firebase.firestore()
        .collection("users")
        .doc(this._user.email)
        .collection("areas");//.orderBy("name", "asc");
      this._areasRef = areasCollectionRef;
      //this.initRoysAreas(); 
      return this._areasRef.get().then(areas => {
        areas.docs.forEach(area => {
          this._areas.push({ name: area.data().name});
        });
        this._areas = this._areas.sort((a,b)=> a.name >= b.name? 1:-1);
      });
  }

  public addArea(name: string): Promise<void> {
    let area = { name: name };
    return this._areasRef.where("name", "==", name).get().then((querySnapshot) => {
      if (querySnapshot.size == 0){
        return this._areasRef.add(area);
      }
    }).then(()=> this.initAreas());
  }

  public removeArea(area: Area): Promise<void>{
    return this._areasRef.where("name", "==", area.name).get().then((querySnapshot) => {
      return querySnapshot.forEach(x=> {
        return x.delete();
      });
    }).then(()=> this.initAreas());
  }

  private initRoysAreas() {
    this._areasRef.get().then((querySnapshot) => {       
        if (querySnapshot.size){
          return;
        }

        this.addArea('מרכז העיר');
          this.addArea('צפון העיר');
          this.addArea('דרום העיר');
          this.addArea('שכונות הרצף');
          this.addArea('הגוש הדתי');
          this.addArea('רמת אפריים');
          this.addArea('רמת חן');
          this.addArea('נת 600 / נת 542');
          this.addArea('קו החוף');
          this.addArea('נוף גלים');
          this.addArea('עיר ימים');
          this.addArea('פולג');
          this.addArea('אגמים');
          this.addArea('האירוסים');
          this.addArea('נורדאו');
          this.addArea('דורה');
          this.addArea('אזורים');
          this.addArea('קרית השרון');
          this.addArea('ותיקים / עמליה');
          this.addArea('מושבים');
          this.addArea('א.ת החדש');
          this.addArea('א.ת אחר');      
      });
  }
}
