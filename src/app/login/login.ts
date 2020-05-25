import { Component } from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { User } from '../../providers';
import { AuthProvider } from '../../providers/auth/auth';
import { TranslateService } from '@ngx-translate/core';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage/ngx';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private loading: Promise<HTMLIonLoadingElement>;
  
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
    private localStorage: Storage) {

  }

  ionViewWillEnter() {
    this.translateService.get([
      'GENERAL_EMAIL_EXAMPLE', 'GENERAL_EMAIL', 'PASSWORD_RECOVERY_TITLE', 'PASSWORD_RECOVERY_MESSAGE',
      'PASSWORD_RECOVERY_SUCCESS', 'GENERAL_APPROVE', 'GENERAL_CANCEL']).subscribe(values => {
        this.translations = values;
      });

    this.localStorage.get(AuthProvider.emailStorageKey).then(
      (email) => this.account.email = email
    );
  }

  // Attempt to login in through our User service
  doLogin(): void {
    this.loading = this.loadingCtrl.create();
    this.loading.present()
    this.user.login(this.account).then((resp) => {
      this.loading.dismiss();
    }, (err: Error) => {
      this.loading.dismiss();
      if (err.name === AuthProvider.emailNotVerifiedErrorCode) {
        this.navCtrl.setRoot("SendVerificationPage");
      }
      else {
        this.showToast(err.message);
      }
    });
  }

  signUp(): void {
    this.navCtrl.setRoot("SignupPage");
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  forgotPassword() {
    const prompt = this.alertCtrl.create({
      title: this.translations.PASSWORD_RECOVERY_TITLE,
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
