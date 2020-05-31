import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, Platform } from '@ionic/angular';
import { Lead } from 'src/models/lead';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Contact, Contacts, ContactName, ContactField } from '@ionic-native/contacts/ngx';
import { LeadCreatePage } from '../lead-create/lead-create.page';

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

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private contacts: Contacts
  ) {
    this.item = this.navParams.get("lead");
    if (this.item.phone){
      this.phoneDisabled = true;
      this.leadPhone = this.item.phone;      
    }
    else{
      this.phoneDisabled = false;
    }

    this.saveToContacts = true;
  }

  public closePage() {
    this.modalCtrl.dismiss();
  }

  public submit() {
    if (!this.leadName || !this.leadPhone){
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
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, this.leadName);
    contact.phoneNumbers = [new ContactField('mobile', this.leadPhone)];
    contact.save().then(
      () => console.log('Contact saved!', contact),
      (error: any) => console.error('Error saving contact.', error)
    );
  }

  private requestUserWriteContactPermission(): Promise<boolean> {
    return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(requestResult => {
      console.log('Request permission?', requestResult.hasPermission)
      return requestResult.hasPermission;
    });
  }

  ngOnInit() {
  }

}
