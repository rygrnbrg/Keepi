import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, Platform, ToastController } from '@ionic/angular';
import { Lead } from 'src/models/lead';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Contact, Contacts, ContactName, ContactField } from '@ionic-native/contacts/ngx';
import { LeadCreatePage } from '../lead-create/lead-create.page';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-lead-save-contact',
  templateUrl: './lead-save-contact.page.html',
  styleUrls: ['./lead-save-contact.page.scss'],
  providers: [AndroidPermissions, Contacts]
})
export class LeadSaveContactPage implements OnInit {
  public item: Lead;
  public leadName: string;
  public leadPhone: string;
  public saveToContacts: boolean;
  public phoneDisabled: boolean;
  private translations: any;
  private SAVE_CONTACT_CB_VALUE:string = "SAVE_CONTACT_CB_VALUE";
  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private contacts: Contacts,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private nativeStorage: NativeStorage
  ) {
    this.item = this.navParams.get("lead");
    if (this.item.phone) {
      this.phoneDisabled = true;
      this.leadPhone = this.item.phone;
    }
    else {
      this.phoneDisabled = false;
    }

    this.saveToContacts = true;

    this.translateService.get([
      'CONTACT_SAVED_SUCCESS', 'CONTACT_SAVED_ERROR',]).subscribe(values => {
        this.translations = values;
      });

      this.getCheckboxState().then(x=> this.saveToContacts = x);
  }

  public closePage() {
    this.modalCtrl.dismiss();
  }

  public submit() {
    if (!this.leadName || !this.leadPhone) {
      return;
    }

    if (this.saveToContacts) {
      this.getPremissionAndSaveContact();
    }

    this.item.name = this.leadName;
    this.item.phone = this.leadPhone;
    this.gotoLeadCreatePage(this.item)
    //this.modalCtrl.dismiss({ lead: this.item });
  }

  private async gotoLeadCreatePage(lead: Lead) {
    let modal = await this.modalCtrl.create({
      component: LeadCreatePage,
      componentProps: { lead: lead }
    });
    modal.present();
    modal.onDidDismiss().then(value => {

    });
  }

  private getPremissionAndSaveContact() {
    if (this.platform.is("cordova")) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_CONTACTS).then(
        result => {
          console.log('Check permission?', result.hasPermission);

          if (result.hasPermission) {
            this.saveContact();
            return;
          }
          this.requestUserWriteContactPermission().then(hasPermission => {
            if (hasPermission) {
              this.saveContact();
            }
            else {
              this.saveToContacts = false;
            }
          })
        }
      );
    }
  }

  private saveContact() {
    this.setCheckboxState();
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, this.leadName);
    contact.phoneNumbers = [new ContactField('mobile', this.leadPhone)];
    contact.save().then(
      () => {
        console.log('Contact saved!', contact);
        this.showToast(this.translations.CONTACT_SAVED_SUCCESS);
      },
      (error: any) => {
        console.error('Error saving contact.', error);
        this.showToast(this.translations.CONTACT_SAVED_ERROR);

      }
    );
  }

  private setCheckboxState(){
    this.nativeStorage.setItem(this.SAVE_CONTACT_CB_VALUE, this.saveToContacts);
  }

  private async getCheckboxState() {
    return await this.nativeStorage.getItem(this.SAVE_CONTACT_CB_VALUE);
  }

  private requestUserWriteContactPermission(): Promise<boolean> {
    return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_CONTACTS).then(requestResult => {
      console.log('Request permission?', requestResult.hasPermission);
      return requestResult.hasPermission;
    });
  }

  ngOnInit() {
  }

  private async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
