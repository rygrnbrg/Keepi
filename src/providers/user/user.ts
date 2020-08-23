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

  public onUserAuthStateChanged() {
    // make this return observable that ensures user is initiated
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
      this.initServerSettings();
    }
  }

  private async initServerSettings() {
    this.optionsCollectionRef = firebase.firestore().collection("users").doc(this._user.email).collection("leadOptions");

    this.optionsCollectionRef.get().then(async x => {
      if (x.empty) {
        this.initServerSettingsDefaults();
      }
      else {
        var optionsCollection = await this.getOptions();
        this.serverSettings.forEach(async leadProp => {
          this._settings[leadProp] = [];

          let doc = optionsCollection.find(doc => this.extractPropName(doc.data()) === leadProp);
          this.initUserSetting(doc);
        });
      }
    });
  }

  private initServerSettingsDefaults() {
    this.serverSettings.forEach(prop => {
      this.optionsCollectionRef.add({ name: prop, options: this.getDefaultSetting(prop) }).then(
        res => {
          res.get().then(doc => {
            this.initUserSetting(doc);
          });
        }
      );
    });
  }

  private initUserSetting(doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>) {
    let data = doc.data();
    let options: string[] = this.extractOptions(data);
    let propName: string = this.extractPropName(data); //i.e "area", "source"
    this._settingsDocs[propName] = doc;
    this._settings[propName] = options.map(x => { return { name: x }; });
  }

  public async getOptions(): Promise<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]> {
    return (await this.optionsCollectionRef.get()).docs;
  }

  public extractPropName(data: firebase.firestore.DocumentData): string {
    return data["name"];
  }

  public extractOptions(data: firebase.firestore.DocumentData): string[] {
    return data["options"];
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

  public getUserData(user?: firebase.User): UserData {
    if (!this._user && user) {
      this._user = user;
    }

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
    value = value.trim();
    let doc = this._settingsDocs[prop];

    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = data["options"];
      let foundOptionIndex = options.indexOf(value);
      console.debug(`user provider - addSetting - got option index: ${foundOptionIndex}`);

      if (foundOptionIndex === -1) {
        options.push(value);
        return doc.ref.update({ "options": options }).then(() => {
          console.info(`user provider - addSetting - after update options succeeded options: ${options}`);
          return doc.ref.get().then(res => this.initUserSetting(res));
        }).catch((reason) => {
          console.error(`user provider - addSetting - after update options failed, options: ${options}, reason: ${reason}`);
          return Promise.reject(reason);
        });
      }
    });
  }

  public removeSetting(prop: LeadProperty, value: string): Promise<void> {
    let doc = this._settingsDocs[prop];
    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = this.extractOptions(data);
      let foundOptionIndex = options.indexOf(value);
      if (foundOptionIndex !== -1) {
        options.splice(foundOptionIndex, 1);
        return doc.ref.update({ "options": options }).then(() => {
          return doc.ref.get().then(res => this.initUserSetting(res))
        });
      }
    });
  }

  private getDefaultSetting(prop: LeadProperty): string[] {
    let props = {};
    props[LeadProperty.source] = ['יד 2', 'אתר הבית', 'פייסבוק', 'שלט', 'עיתון מקומי', 'המלצה / אחר'];
    props[LeadProperty.property] =
      ["דירה", "קוטג' / בית פרטי", "פנטהאוז / מיני פנט'", "דירת גן", "דופלקס", "משק / נחלה",
        "מרתף", "מחולקת", "מחסן", "משרד", "חנות", "אולם", "תעשייה", "מגרש"];
    props[LeadProperty.rooms] = ["1", "2", "3", "4", "5", "6", "7+", "מסחרי"];
    props[LeadProperty.meters] = ["0_50", "51_100", "101_250", "251_400", "401_600", "601_1000", "1001_5000", "5001_+"];
    props[LeadProperty.area] = ['מרכז העיר', 'צפון העיר', 'דרום העיר', 'שכונות הרצף', 'הגוש הדתי', 'רמת אפריים', 'רמת חן', 'נת 600 / נת 542', 'קו החוף', 'נוף גלים', 'עיר ימים', 'פולג', 'אגמים', 'האירוסים', 'נורדאו', 'דורה', 'אזורים', 'קרית השרון', 'ותיקים / עמליה', 'מושבים', 'א.ת החדש', 'א.ת אחר',]
    return props[prop];
  }
}
