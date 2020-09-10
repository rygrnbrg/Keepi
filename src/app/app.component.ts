import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/providers';
import * as firebase from 'firebase';
import { LeadProperty } from 'src/models/LeadProperty';
import { Store } from '@ngrx/store';
import * as userActions from '../providers/user/store/user.actions'
import * as fromApp from './store/app.reducer';
import { UserSetting, UserData } from 'src/providers/user/models';
import { UserState } from 'src/providers/user/store/user.reducer';
import { filter, map } from 'rxjs/operators';
import { isNull } from 'lodash';
import { isNullOrUndefined } from 'util';
import { LeadsProvider } from 'src/providers/leads/leads.provider';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata.provider';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  private staticSettings: LeadProperty[] = [LeadProperty.rooms, LeadProperty.meters];
  private initiatedUserEmail = "";

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private user: User,
    private store: Store<fromApp.AppState>,
    private leadsProvider: LeadsProvider
  ) {

  }

  ngOnInit() {
    this.initUser();
    this.platform.ready().then(() => {
      this.subscribeToAuthChange();
      this.translate.setDefaultLang('he');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  public logout() {
    this.user.logout();
  }


  private initUser() {
    this.subscribeToServerDefaultsSettingsReady();
  }

  private getDefaultSettings(): { [leadProp: string]: UserSetting[] } {
    let settings: { [leadProp: string]: UserSetting[] } = {};
    this.staticSettings.forEach(x => {
      let defaults = this.user.getDefaultSetting(x);
      let userSettings = defaults.map(x => { return <UserSetting>{ name: x }; });
      settings[x] = userSettings;
    });

    return settings;
  }

  private async subscribeToServerDefaultsSettingsReady() {
    this.store.select(x => x.User)
      .pipe(filter(x => !isNullOrUndefined(x)))
      .pipe(filter(x => x.DefaultServerSettingsReady))
      .pipe(map(x=> x.Data))
      .pipe(filter(x => !isNullOrUndefined(x) && x.email !== this.initiatedUserEmail))
      .subscribe((userData: UserData) => {
        this.initiatedUserEmail = userData.email;
        this.initUserSettings();
        this.leadsProvider.initLeads(userData);
      });
  }

  private initUserSettings() {
    let clientSettings = this.getDefaultSettings();
    this.user.getServerSettings().then(serverSettings => {
      let settings = { ...clientSettings, ...serverSettings };

      this.store.dispatch(new userActions.UpdateUserSettings({ settings: settings }));
    });
  }

  private subscribeToAuthChange(): void {
    firebase.auth().onAuthStateChanged((res) => {
      if (!res) {
        this.gotoPage("login");
        return;
      }

      if (res.emailVerified) {
        this.user.loginExistingUser(res);
        this.gotoPage("tabs");
        return
      }

      this.gotoPage("sendverification", { email: res.email })
    });
  }

  private gotoPage(page: string, params?: any) {
    var navigateParam = params ? [page, params] : [page];
    this.navCtrl.navigateRoot(navigateParam);
  }
}
