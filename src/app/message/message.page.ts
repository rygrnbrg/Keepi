import { Component, OnInit } from '@angular/core';
import { Contact } from './../../models/lead';
import { NavController, NavParams, AlertController, Platform, ModalController, ToastController } from '@ionic/angular';
import { SMS } from '@ionic-native/sms/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SmsResult } from '../../models/smsResult';
import { AvatarPipe } from "../../pipes/avatar/avatar";

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
  providers: [AvatarPipe, SMS, AndroidPermissions]
})
export class MessagePage implements OnInit {
  public contacts: Contact[] = [];
  public contactsHeaderLimit: number = 5;
  public messageText: string = "";
  private translations: any;
  private messageSent: boolean;
  private permissionRefused: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private sms: SMS,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.translateService.get([
      'SMS_MESSAGE_WILL_BE_SENT_TO', 'CONTACTS', 'GENERAL_CANCEL', 'GENERAL_APPROVE', 'LEADS_RECIEVED_MESSAGE', 
      'SMS_PERMISSIONS_REFUSED','SMS_SEND_ERROR']).subscribe(values => {
        this.translations = values;
      });

    this.contacts = this.navParams.get("contacts");
  }


  ngOnInit() {
    this.askAndroidSMSPermissions();
  }

  private askAndroidSMSPermissions() {
    if (this.platform.is("android") && this.platform.is("hybrid")) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(
        result => {
          console.log('Ceck SMS permission?', result.hasPermission);
          if (result.hasPermission) {
            this.permissionRefused = false;
          } else
            this.requestUserSMSPermission();
        },
        err => this.requestUserSMSPermission()
      );
    }
  }

  private requestUserSMSPermission() {
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(requestResult => {
      console.log('Request SMS permission?', requestResult.hasPermission)
      if (!requestResult.hasPermission) {
        this.permissionRefused = true;
      }
      else {
        this.permissionRefused = false;
      }
    });
  }

  public removeContact(contact: Contact): void {
    if (this.contacts.length == 1) {
      return;
    }

    this.contacts.splice(this.contacts.indexOf(contact), 1);
  }

  public send() {
    if (this.contacts.length == 0 || !this.messageText || !this.messageText.length) {
      console.log("Contacts list for SMS send is empty");
      return;
    }

    if (this.contacts.length === 1) {
      this.sendSMS();
    }
    else {
      this.presentConfirmSMS();
    }
  }

  public closePage() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  private async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }


  private async presentConfirmSMS() {
    let message = `${this.translations.SMS_MESSAGE_WILL_BE_SENT_TO}-${this.contacts.length} ${this.translations.CONTACTS}`;
    const prompt = await this.alertCtrl.create({
      message: message,
      buttons: [
        {
          text: this.translations.GENERAL_CANCEL,
          handler: data => {

          },
          cssClass: 'danger-color'
        },
        {
          text: this.translations.GENERAL_APPROVE,
          handler: data => {
            this.sendSMS();
          },
          cssClass: 'primary'
        }
      ]
    });
    prompt.present();
  }

  private async presentRequestPermissions() {
    let message = `${this.translations.SMS_PERMISSIONS_REFUSED}`;
    const prompt = await this.alertCtrl.create({
      message: message,
      buttons: [
        {
          text: this.translations.GENERAL_APPROVE,
          handler: data => {
            this.requestUserSMSPermission();
          },
          cssClass: 'primary'
        }
      ]
    });
    prompt.present();
  }

  private sendSMS() {
    if (this.permissionRefused) {
      this.presentRequestPermissions();
      return;
    }

    if (this.messageSent === true) {
      return;
    }

    if (this.contacts.length == 0 || !this.messageText || !this.messageText.length) {
      console.log("Contacts list for SMS send is empty");
      return;
    }

    let allPhones = this.contacts.map(contact => contact.phone);
    let phones = Array.from(new Set(allPhones.map((item: any) => item)));

    if (this.platform.is("android") && this.platform.is("hybrid")) {
      this.sms.send(phones[0], this.messageText).then(
        (value) => {
          this.messageSent = true;
          console.log("Meassage sent to " + phones[0], "value is: " + value);
          if (phones.length > 1) {
            for (let index = 1; index < phones.length; index++) {
              let phone = phones[index];
              this.sms.send(phone, this.messageText).then((value) => {
                console.log("Meassage sent to " + phone, "value is: " + value);
              });
            }
          }
          let message = this.translations.LEADS_RECIEVED_MESSAGE.replace("{numberOfLeads}", phones.length);
          this.showToast(message).then(() => this.modalCtrl.dismiss());
        },
        (reason) => {
          console.log(reason);
          if (reason === "User has denied permission") {
            this.askAndroidSMSPermissions();
          }
          else {
            this.showToast(this.translations.SMS_SEND_ERROR);
          }
        }
      );
    }
    else {
      let result: SmsResult = { success: true, sentCount: phones.length, text: this.messageText };
      let message = this.translations.LEADS_RECIEVED_MESSAGE.replace("{numberOfLeads}", result.sentCount);
      this.showToast(message).then(() => this.modalCtrl.dismiss(result));
    }

  }
}

