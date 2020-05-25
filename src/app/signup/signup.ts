import { Component } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { User } from '../../providers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  account: { email: string, password: string } = {
    email: '',
    password: ''
  };

  private translations: any;
  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translateService: TranslateService) {
    translateService.get(['VERIFY_TITLE', 'VERIFY_MESSAGE', 'VERIFY_BUTTON', 'GENERAL_LATER']).subscribe(values => {
      this.translations = values;
    });
  }

  doSignup() {
    // Attempt to login in through our User service
    this.user.signup(this.account).then((res) => {
      this.user.sendVerificationEmail().then(
        () => {
          this.showPrompt();
        },
        err => this.navCtrl.navigateRoot("sendverification")
      )
    }, (err: Error) => {
      this.showToast(err.message);
    });
  }

  gotoLogin() {
    this.navCtrl.navigateRoot("login");
  }

  async showPrompt() {
    const prompt = await this.alertCtrl.create({
      header: this.translations.VERIFY_TITLE,
      message: this.translations.VERIFY_MESSAGE,
      buttons: [
         {
          text: this.translations.VERIFY_BUTTON,
          handler: data => {
            this.gotoLogin();
          }
        }]
    });
    prompt.present();
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
