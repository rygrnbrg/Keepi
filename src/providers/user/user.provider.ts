import * as userActions from './store/user.actions';
import * as firebase from 'firebase/app';
import * as fromApp from 'src/app/store/app.reducer';
import { Injectable } from '@angular/core';
import { AuthProvider } from '../auth/auth';
import { AuthenticationData } from '../../models/authentication';
import { LeadProperty } from 'src/models/LeadProperty';
import { Store } from '@ngrx/store';
import { UserSetting, UserData, UserSettings } from './models';
import { filter, map } from 'rxjs/operators';


@Injectable()
export class User {
  private userSettings: UserSettings = { settings: {} };
  private settingsDocs: { [leadProp: string]: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> } = {};
  private optionsCollectionRef: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  private userData: UserData;
  private serverSettings: LeadProperty[] = [LeadProperty.area, LeadProperty.property, LeadProperty.source];

  constructor(private authProvider: AuthProvider, private store: Store<fromApp.AppState>) {
    this.subscribeToAuthChanged();
    this.userSettings.settings["test"] = [];
  }

  public login(data: AuthenticationData): Promise<UserData> {
    return this.authProvider.doLogin(data).then(
      res => {
        return { id: res.uid, email: res.email, emailVerified: res.emailVerified }
      },
      reason => {
        return reason;
      });
  }

  public logout(): void {
    this.authProvider.doLogout();
  }

  private subscribeToAuthChanged(): void {
    this.store.select(x => x.Auth).pipe(
      filter(x => !(x === null || x === undefined)),
      map(x => x.Data)
    ).subscribe(userData => {
      this.initUser(userData);
    });
  }

  private initUser(userData: UserData): void {
    if (!userData) {
      if (this.userData) {
        this.store.dispatch(new userActions.Logout());
      }
      this.userData = null;
      this.userSettings.settings = {};
      this.settingsDocs = {};
      this.optionsCollectionRef = null;

      return;
    }

    if (userData && this.userData && this.userData.email === userData.email) {
      return;
    }

    this.userData = userData;
    this.optionsCollectionRef = firebase.firestore().collection("users").doc(userData.email).collection("leadOptions");

    this.store.dispatch(new userActions.InitUserSuccess(userData));
    this.initServerSettings();
  }

  private initServerSettings() {
    this.optionsCollectionRef.get().then(async x => {
      if (x.empty) {
        this.initServerSettingsDefaults();
      }

      this.userSettings.settings =  await this.getServerSettings();
      this.store.dispatch(new userActions.ServerSettingsReady(this.userSettings));     
    });
  }

  private async initServerSettingsDefaults() {
    this.serverSettings.forEach(async prop => {
      let doc = await this.optionsCollectionRef.add({ name: prop, options: this.getDefaultSetting(prop) });
    });
  }

  public getDefaultSetting(prop: LeadProperty): string[] {//todo: move to default settings provider
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

  public addSetting(prop: LeadProperty, value: string): Promise<void> {
    value = value.trim();
    let doc = this.settingsDocs[prop];

    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = data["options"];
      let foundOptionIndex = options.indexOf(value);
      console.debug(`user provider - addSetting - got option index: ${foundOptionIndex}`);

      if (foundOptionIndex === -1) {
        options.push(value);
        return doc.ref.update({ "options": options }).then(() => {
          console.info(`user provider - addSetting - after update options succeeded options: ${options}`);
          return doc.ref.get().then(res => this.updateLocalUserSetting(res));
        }).catch((reason) => {
          console.error(`user provider - addSetting - after update options failed, options: ${options}, reason: ${reason}`);
          return Promise.reject(reason);
        });
      }
    });
  }

  public removeSetting(prop: LeadProperty, value: string): Promise<void> {
    let doc = this.settingsDocs[prop];
    return doc.ref.get().then((result) => {
      let data = result.data();
      let options: string[] = this.extractOptions(data);
      let foundOptionIndex = options.indexOf(value);
      if (foundOptionIndex !== -1) {
        options.splice(foundOptionIndex, 1);
        return doc.ref.update({ "options": options }).then(() => {
          return doc.ref.get().then(res => this.updateLocalUserSetting(res))
        });
      }
    });
  }

  public async getServerSettings(): Promise<{ [leadProp: string]: UserSetting[] }> {
    let settings: { [leadProp: string]: UserSetting[] } = {};

    return this.optionsCollectionRef.get().then(async x => {
      var optionsCollection = await this.getOptions();
      this.serverSettings.forEach(async leadProp => {
        settings[leadProp] = [];
        let doc = optionsCollection.find(doc => this.extractPropName(doc.data()) === leadProp);
        let data = doc.data();
        let options: string[] = this.extractOptions(data);
        let propName: string = this.extractPropName(data); //i.e "area", "source"
        this.settingsDocs[propName] = doc;
        settings[propName] = options.map(x => { return <UserSetting>{ name: x }; });
      });

      return {...settings};
    });
  }

  private updateLocalUserSetting(doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): void {
    let data = doc.data();
    let options: string[] = this.extractOptions(data);
    let propName: string = this.extractPropName(data); //i.e "area", "source"
    this.settingsDocs[propName] = doc;
    this.userSettings.settings[propName] = options.map(x => { return { name: x }; });

    this.store.dispatch(new userActions.UpdateUserSettings(this.userSettings));
  }

  public async getOptions(): Promise<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]> { //this should be deprecated to ngrx settings only 
    return (await this.optionsCollectionRef.get()).docs;
  }

  public extractPropName(data: firebase.firestore.DocumentData): string {
    return data["name"];
  }

  public extractOptions(data: firebase.firestore.DocumentData): string[] {
    return data["options"];
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
}
