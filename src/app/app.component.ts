import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/providers';
import * as firebase from 'firebase';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  email: string = "";

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private user: User
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.translate.setDefaultLang('he');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.subscribeToAuthChange();
    });
  }

    openPage(page) {
    this.gotoPage(page.component);
  }

  public logout() {
    this.user.logout();
  }

  private subscribeToAuthChange(): void {
    firebase.auth().onAuthStateChanged((res) => {
      if (!res) {
        this.gotoPage("login");
        return;
      }

      if (res.emailVerified) {
        this.user.loginExistingUser(res);
        this.email = res.email;
        this.gotoPage("tabs"); 
        return
      }
      
      this.gotoPage("sendverification", { email: res.email })
    });
  }

  private gotoPage(page: string, params?: any) {
    var navigateParam = params? [page, params] :[page];
    this.navCtrl.navigateRoot(navigateParam);
  }
}
