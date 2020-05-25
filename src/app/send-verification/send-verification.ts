import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { User } from '../../providers';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-send-verification',
  templateUrl: 'send-verification.html',
})
export class SendVerificationPage {
  private translations: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public user: User,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translateService: TranslateService) {
    translateService.get(['SEND_VERIFICATION_SENT_SUCCESS_TITLE', 'SEND_VERIFICATION_SENT_SUCCESS_MESSAGE', 'VERIFY_BUTTON']).subscribe(values => {
      this.translations = values;
    });
  }

  sendVerification() {
    this.user.sendVerificationEmail().then(
      () => this.showPrompt(),
      (err) => this.showToast(err)
    )
  }

  showPrompt() {
    const prompt = this.alertCtrl.create({
      title: this.translations.SEND_VERIFICATION_SENT_SUCCESS_TITLE,
      message: this.translations.SEND_VERIFICATION_SENT_SUCCESS_MESSAGE,
      buttons: [{
          text: this.translations.VERIFY_BUTTON,
          handler: data => {
            this.gotoLogin();
          }
        }]
    });
    prompt.present();
  }

  gotoLogin() {
    this.user.logout();
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendVerificationPage');
  }

}
