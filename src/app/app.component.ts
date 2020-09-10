import * as userActions from '../providers/user/store/user.actions'
import * as fromApp from './store/app.reducer';
import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/providers';
import { LeadProperty } from 'src/models/LeadProperty';
import { Store } from '@ngrx/store';
import { UserSetting, UserData } from 'src/providers/user/models';
import { filter, map } from 'rxjs/operators';
import { LeadsProvider } from 'src/providers/leads/leads.provider';


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
    private store: Store<fromApp.AppState>
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
    this.subscribeToServerSettingsReady();
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

  private async subscribeToServerSettingsReady() {
    this.store.select(x => x.User).pipe(
      filter(x => !(x === null || x === undefined)),
      filter(x => x.ServerSettingsReady),
      map(x => x.Data),
      filter(x => !(x === null || x === undefined) && x.email !== this.initiatedUserEmail))
      .subscribe((userData: UserData) => {
        this.initiatedUserEmail = userData.email;
        this.initUserSettings();
      });
  }

  private initUserSettings() {
    let clientSettings = this.getDefaultSettings();
    this.user.getServerSettings().then(serverSettings => {
      let settings = { ...clientSettings, ...serverSettings };
      this.store.dispatch(new userActions.UpdateUserSettings({ settings: settings }));
    });
  }

  private subscribeToAuthChange(): void {//todo: refactor as guard!!
    this.store.select(x => x.Auth)
      .subscribe(res => {
        if (!res || !res.Ready) {
          return;
        }

        if (!res.Data) {
          this.gotoPage("login");
          return;
        }

        if (res.Data.emailVerified) {
          this.gotoPage("tabs");
          return
        }

        this.gotoPage("sendverification", { email: res.Data.email })
      });
  }

  private gotoPage(page: string, params?: any) {
    var navigateParam = params ? [page, params] : [page];
    this.navCtrl.navigateRoot(navigateParam);
  }
}
