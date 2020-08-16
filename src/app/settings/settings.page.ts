import { Component, OnInit } from '@angular/core';
import { UserData, UserSetting } from './../../providers/user/user';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { User, Settings } from '../../providers';
import { Router, ActivatedRoute } from '@angular/router';
import { LeadProperty } from 'src/models/LeadProperty';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  providers: [LeadPropertyMetadataProvider]

})
export class SettingsPage {
  public items: UserSetting[];
  public userData: UserData;
  private translations: any;
  private newItemName: string;
  public multivalueMetadataEditableSettings: EditableSetting[];
  public form: FormGroup;
  private currentLeadProperty: LeadProperty;
  page: string = 'main';
  pageTitleKey: string = 'SETTINGS_TITLE';
  pageTitle: string;

  subSettings: any = SettingsPage;

  constructor(
    //public settings: Settings,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public user: User,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,) {
    this.multivalueMetadataEditableSettings = this.leadPropertyMetadataProvider.get().filter(x=>x.editable)
    .map(x=> {  
      return { name: x.id, key: x.stringsKey }
    });

    let translations = [
      'SETTINGS_ITEM_DELETE_CONFIRM', 'GENERAL_CANCEL', 'GENERAL_APPROVE',
      'SETTINGS_ITEM_ADD_TITLE', 'SETTINGS_ITEM_ADD_PLACEHOLDER', 'GENERAL_ACTION_ERROR',
      'SETTINGS_ITEM_ADD_SUCCESS','GENERAL_ALREADY_EXISTS_IN_LIST', 'GENERAL_TO_ADD'];

    this.multivalueMetadataEditableSettings.forEach(x => translations.push(x.key + "_SINGLE"));

    this.translate.get(translations).subscribe(values => {
      this.translations = values;
    });


    this.route.queryParams.subscribe(params => {
      this.page = params.page || this.page;
      this.pageTitleKey = params.pageTitleKey || this.pageTitleKey;

      this.translate.get(this.pageTitleKey).subscribe((res) => {
        this.pageTitle = res; 
      });
    });
  }



  _buildForm() {

    this.userData = this.user.getUserData();
    switch (this.page) {
      case 'main':
        break;
      default:
      this.initSettingsPage(LeadProperty[this.page]); 
      break;
    }
  }

  private async initSettingsPage(prop: LeadProperty) {
    let loading = await this.loadingCtrl.create();
    loading.present();
    this.currentLeadProperty = prop;
    let docs = await this.user.getOptions();
    loading.dismiss();
    let optionsDoc = docs.find(doc=> this.user.extractPropName(doc.data()) === prop);
    this.items = this.user.extractOptions(optionsDoc.data()).map(x => { return { name: x } });
  }

  ionViewDidLoad() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});
    this._buildForm();
  }

  public gotoSettingsPage(setting: EditableSetting) {
    this.router.navigate(["settings"],
      {
        queryParams: {
          page: setting.name,
          pageTitleKey: 'SETTINGS_' + setting.key
        }
      });
  }


  ngOnChanges() {
    console.log('Ng All Changes');
  }

  public logout() {
    this.user.logout();
  }

  public async confirmItemRemove(setting: EditableSetting, item: UserSetting) {
    let singleKey = `${setting.key}_SINGLE`;
    let message = `${this.translations['SETTINGS_ITEM_DELETE_CONFIRM']} ${this.translations[singleKey]}`;
    message += ` "${item.name}"?`;
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
            this.removeItem(item)
          },
          cssClass: 'primary'
        }
      ]
    });
    prompt.present();
  }

  private async removeItem(item: UserSetting): Promise<void> {
    let loading = await this.loadingCtrl.create();
    loading.present();
    return this.user.removeSetting(this.currentLeadProperty, item.name).then(() => {
      loading.dismiss();
      this.removeFromView(item);
    });
  }

  private async addItem(name: string) {
    if (this.items.find(x=> x.name === name)){
      this.showToast(`"${name}" ${this.translations.GENERAL_ALREADY_EXISTS_IN_LIST}`);
      return;
    }

    let loading = await this.loadingCtrl.create();
    loading.present();
    this.user.addSetting(this.currentLeadProperty, name).then(() => {
      this.items = this.user.getUserData().settings[this.currentLeadProperty];
      loading.dismiss();
      this.showToast(`"${name}" ${this.translations.SETTINGS_ITEM_ADD_SUCCESS}`);
    }, () => {
      this.showToast(this.translations.GENERAL_ACTION_ERROR);
    });//todo:handle error
  }

  private removeFromView(setting: UserSetting) {
    this.items.splice(this.items.indexOf(setting), 1);
  }

  public async addItemModal(setting: EditableSetting) {
    let singleKey = `${setting.key}_SINGLE`;
    this.newItemName = "";

    const prompt = await this.alertCtrl.create({
      // header: `${this.translations["SETTINGS_ITEM_ADD_TITLE"]} ${this.translations[singleKey]}`,
      inputs: [
        {
          name: 'item',
          placeholder: `${this.translations["SETTINGS_ITEM_ADD_PLACEHOLDER"]} ${this.translations[singleKey]} ${this.translations["GENERAL_TO_ADD"]}`,
          value: this.newItemName,
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
          handler: async data => {
            if (!data.item && !data.item.length) {
              return;
            }
            this.addItem(data.item);
          }
        }]
    });
    prompt.present();
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

export class EditableSetting {
  public name: string;
  public key: string;
}
