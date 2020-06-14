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
  public serverSettings: LeadProperty[] = [LeadProperty.area, LeadProperty.property, LeadProperty.source];
  public staticSettings: LeadProperty[] = [LeadProperty.rooms, LeadProperty.meters];

  private _user: firebase.User;
  private _settings: { [leadProp: string]: UserSetting[] } = {};
  private _settingsDocs: { [leadProp: string]: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> } = {};
  private optionsCollectionRef: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

  constructor(private authProvider: AuthProvider) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.initUser(user);
      }
    });

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
        if (res) {
          this.initUser(res);
        }
      },
      err => {
        return Promise.reject(err);
      }
    );
  }

  private initUser(user: firebase.User): void {
    this._user = user;
    if (user) {
      this.initSettings();
    }
  }

  private async initSetting(leadProp: LeadProperty): Promise<void> {
    if (!this._user) {
      return Promise.resolve();
    }

    this._settings[leadProp] = [];
    var docs = (await this.optionsCollectionRef.get()).docs;

    docs.forEach(doc => {
      let data = doc.data();
      let options: string[] = data["options"];
      let propName: string = data["name"];//i.e "area", "source"
      this._settingsDocs[propName] = doc;
      this._settings[propName] = options.map(x => { return { name: x } });
    });
  }

  private async initSettings() {
    this.optionsCollectionRef = firebase.firestore().collection("users").doc(this._user.email).collection("leadOptions");

    this.optionsCollectionRef.get().then(x => {
      if (x.empty) {
        this.serverSettings.forEach(prop => {
          this.optionsCollectionRef.add({ name: prop, options: this.getDefaultSetting(prop) }).then(
            res => {
              this.initSetting(prop);
            }
          );
        });
      }
      else {
        this.serverSettings.forEach(prop => this.initSetting(prop));
      }
    });
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
      console.error('User provider - getUserData: User is null');
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

  public addSetting(prop: LeadProperty, value: string): Promise<void> {
    let setting: UserSetting = { name: value };
    let doc = this._settingsDocs[prop];
    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = data["options"];
      let foundOptionIndex = options.indexOf(value);
      if (foundOptionIndex === -1) {
        options.push(value);
        doc.ref.update({ "options": options });
      }
    }).then(() => this.initSetting(prop));
  }

  public removeSetting(prop: LeadProperty, value: string): Promise<void> {
    let setting: UserSetting = { name: value };
    let doc = this._settingsDocs[prop];
    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = data["options"];
      let foundOptionIndex = options.indexOf(value);
      if (foundOptionIndex !== -1) {
        options.splice(foundOptionIndex, 1);
        doc.ref.update({ "options": options });
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
