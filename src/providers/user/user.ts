import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { AuthProvider } from '../auth/auth';
import { AuthenticationData } from '../../models/authentication';
import { Observable } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  Query

} from "angularfire2/firestore";
import { firestore } from "firebase";

export interface UserData {
  id: string;
  email: string;
  areas: Area[];
}

export interface Area {
  name: string
}

@Injectable()
export class User {
  private _user: firebase.User;
  private _areasRef : AngularFirestoreCollection<firestore.DocumentData>;
  private _areas : Area[];
  private defaultAreasInitiated = false;
  
  constructor(
    private authProvider: AuthProvider,     
    private afStore: AngularFirestore) {
    authProvider.afAuth.authState.subscribe((res) => {
      this.initUser(res);
    });
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

  public authenticationState(): Observable<firebase.User | null> {
    return this.authProvider.afAuth.authState
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
    let areasCollectionRef = this.afStore
        .collection("users")
        .doc(this._user.email)
        .collection("areas", ref => ref.orderBy("name", "asc"));
      this._areasRef = areasCollectionRef;
      return this._areasRef.ref.get().then(areas => {
        areas.docs.forEach(area => {
          this._areas.push({ name: area.data().name});
        });
        this._areas = this._areas.sort((a,b)=> a.name >= b.name? 1:-1);
      });      
  }

  public addArea(name: string): Promise<void> {
    let area = { name: name };
    return this._areasRef.ref.where("name", "==", name).get().then((querySnapshot) => {
      if (querySnapshot.size == 0){
        return this._areasRef.add(area);
      }
    }).then(()=> this.initAreas());
  }

  public removeArea(area: Area): Promise<void>{
    return this._areasRef.ref.where("name", "==", area.name).get().then((querySnapshot) => {
      return querySnapshot.forEach(x=> {
        return x.ref.delete();
      });
    }).then(()=> this.initAreas());
  }

  // private initRoysAreas() {
  //   this._areasRef.ref.get().then((querySnapshot) => {       
  //       if (querySnapshot.size){
  //         return;
  //       }

  //       this.addArea('מרכז העיר');
  //         this.addArea('צפון העיר');
  //         this.addArea('דרום העיר');
  //         this.addArea('שכונות הרצף');
  //         this.addArea('הגוש הדתי');
  //         this.addArea('רמת אפריים');
  //         this.addArea('רמת חן');
  //         this.addArea('נת 600 / נת 542');
  //         this.addArea('קו החוף');
  //         this.addArea('נוף גלים');
  //         this.addArea('עיר ימים');
  //         this.addArea('פולג');
  //         this.addArea('אגמים');
  //         this.addArea('האירוסים');
  //         this.addArea('נורדאו');
  //         this.addArea('דורה');
  //         this.addArea('אזורים');
  //         this.addArea('קרית השרון');
  //         this.addArea('ותיקים / עמליה');
  //         this.addArea('מושבים');
  //         this.addArea('א.ת החדש');
  //         this.addArea('א.ת אחר');      
  //     });
  // }
}
