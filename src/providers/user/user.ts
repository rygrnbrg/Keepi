import { Injectable } from '@angular/core';
import { AuthProvider } from '../auth/auth';
import { AuthenticationData } from '../../models/authentication';
import * as firebase from 'firebase/app';
import { LeadProperty } from 'src/models/LeadProperty';


export interface UserData {
  id: string;
  email: string;
  settings: { [leadProp: string]: UserSetting[]; };
}

export interface UserSetting {
  name: string;
}

export interface Area extends UserSetting {

}

@Injectable()
export class User {
  private _user: firebase.User;
  private _settingsRefs: { [leadProp: string]: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>; } = {};
  private _settingsDocs: { [leadProp: string]: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>; } = {};
  private _settings: { [leadProp: string]: UserSetting[]; } = {};
  public serverSettings: LeadProperty[] = [LeadProperty.area, LeadProperty.property, LeadProperty.source];
  public staticSettings: LeadProperty[] = [LeadProperty.rooms, LeadProperty.meters];

  constructor(
    private authProvider: AuthProvider) {
    firebase.auth().onAuthStateChanged(user => this.initUser(user));
    this.initDefaultSettings();
  }

  private initDefaultSettings() {
    this.staticSettings.forEach(x => {
      let defaults = this.getDefaultSetting(x);
      let userSettings = defaults.map(x => { return { name: x }; });
      this._settings[x] = userSettings;
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
    if (!this._user) {
      return null;
    }

    return {
      id: this._user.uid,
      email: this._user.email,
      settings: this._settings
    };
  }

  public logout() {
    this.authProvider.doLogout().then(this._user = null);
  }

  private initUser(user: firebase.User): void {
    this._user = user;
    this.serverSettings.forEach(x => this.initSetting(x));
    this.setDefaults();
  }

  private async setDefaults() {
    let settingsCollectionRef = firebase.firestore().collection("users").doc(this._user.email).collection("leadOptions");
    settingsCollectionRef.get().then(x => {
      if (x.empty) {
        this.serverSettings.forEach(prop => {
          settingsCollectionRef.add({ name: prop, options: this.getDefaultSetting(prop) });
        });
      }
    });
  }

  private async initSetting(leadProp: LeadProperty): Promise<void> {
    if (!this._user) {
      return Promise.resolve();
    }

    this._settings[leadProp] = [];
    let collectionRef = firebase.firestore()
      .collection("users")
      .doc(this._user.email)
      .collection("leadOptions")
      .get();
    var docs = (await collectionRef).docs;
    docs.forEach(doc => {
      this._settingsDocs[doc.data()["name"]] = doc;
      let options: string[] = doc.data()["options"];
      this._settings[doc.data()["name"]] = options.map(x => { return { name: x } });
    });
  }

  public addSetting(prop: LeadProperty, value: string): Promise<void> {
    let setting: UserSetting = { name: value };
    let ref = this._settingsRefs[prop];
    return ref.where("name", "==", value).get().then((querySnapshot) => {
      if (querySnapshot.size == 0) {
        return ref.add(setting);
      }
    }).then(() => this.initSetting(prop));
  }

  public removeSetting(prop: LeadProperty, value: string): Promise<void> {
    return this._settingsRefs[prop].where("name", "==", value).get().then((querySnapshot) => {
      if (querySnapshot.size > 0) {
        return querySnapshot.docs[0].ref.delete();
      }
    }).then(() => this.initSetting(prop));
  }

  private getDefaultSetting(prop: LeadProperty): string[] {
    let props = {};
    props[LeadProperty.source] = ['יד 2', 'אתר הבית', 'פייסבוק', 'שלט', 'עיתון מקומי', 'המלצה / אחר'];
    props[LeadProperty.property] =
      ["דירה", "קוטג' / בית פרטי", "פנטהאוז / מיני פנט'", "דירת גן", "דופלקס", "משק / נחלה",
        "מרתף", "מחולקת", "מחסן", "משרד", "חנות", "אולם", "תעשייה", "מגרש"];
    props[LeadProperty.rooms] = ["1", "2", "3", "4", "5", "6", "יותר מ-6"];
    props[LeadProperty.meters] = ["עד 50", "51 - 100", "101 - 250", "251 - 400", "401 - 600", "601 - 1,000", "1,001 - 5,000", "יותר מ-5,000"];
    props[LeadProperty.area] = ['מרכז העיר', 'צפון העיר', 'דרום העיר', 'שכונות הרצף', 'הגוש הדתי', 'רמת אפריים', 'רמת חן', 'נת 600 / נת 542', 'קו החוף', 'נוף גלים', 'עיר ימים', 'פולג', 'אגמים', 'האירוסים', 'נורדאו', 'דורה', 'אזורים', 'קרית השרון', 'ותיקים / עמליה', 'מושבים', 'א.ת החדש', 'א.ת אחר',]
    return props[prop];
  }
}
