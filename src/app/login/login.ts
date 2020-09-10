import { Component } from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { User } from '../../providers';
import { AuthProvider } from '../../providers/auth/auth';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  account: { email: string, password: string } = {
    email: '',
    password: ''
  };

  private translations: any;

  constructor(
    private navCtrl: NavController,
    private user: User,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage) {
    this.translateService.get([
      'GENERAL_EMAIL_EXAMPLE', 'GENERAL_EMAIL', 'PASSWORD_RECOVERY_TITLE', 'PASSWORD_RECOVERY_MESSAGE',
      'PASSWORD_RECOVERY_SUCCESS', 'GENERAL_APPROVE', 'GENERAL_CANCEL']).subscribe(values => {
        this.translations = values;
      });
  }

  ionViewWillEnter() {
    console.log(`Getting item from native storage: ${AuthProvider.emailStorageKey}`);
    this.storage.getItem(AuthProvider.emailStorageKey).then(
      (email) => {
        console.log(`Got item from native storage: ${AuthProvider.emailStorageKey}, value: ${email}`);
        this.account.email = email;
      }, reason => {
        console.log(`Failed getting item from native storage: ${AuthProvider.emailStorageKey}, reason: ${reason}`);
      }
    );
  }

  async doLogin() {
    let loading = await this.loadingCtrl.create();
    loading.present();
    this.user.login(this.account).then(() => {
      loading.dismiss();
    }, (err: Error) => {
      loading.dismiss();
      if (err.name === AuthProvider.emailNotVerifiedErrorCode) {
        this.navCtrl.navigateRoot("sendverification");
      }
      else {
        this.showToast(err.message);
      }
    });
  }

  signUp(): void {
    this.navCtrl.navigateRoot("signup");
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async forgotPassword() {
    const prompt = await this.alertCtrl.create({
      header: this.translations.PASSWORD_RECOVERY_TITLE,
      message: this.translations.PASSWORD_RECOVERY_MESSAGE,
      inputs: [
        {
          name: 'email',
          placeholder: this.translations.GENERAL_EMAIL_EXAMPLE,
          value: this.account.email
        },
      ],
      buttons: [
        {
          text: this.translations.GENERAL_CANCEL,
          handler: data => {

          }
        },
        {
          text: this.translations.GENERAL_APPROVE,
          handler: data => {
            this.user.resetPassword(data.email).then(
              () => this.showToast(this.translations.PASSWORD_RECOVERY_SUCCESS),
              (err: Error) => this.showToast(err.message),
            );
          }
        }
      ]
    });
    prompt.present();
  }
}
