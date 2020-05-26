import { Component, OnInit } from '@angular/core';
import { Area, UserData, UserSetting } from './../../providers/user/user';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { User, Settings } from '../../providers';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage{
  public items : UserSetting[];
  public userData: UserData;  
  private translations: any;
  private newItemName: string;
  public multivalueMetadataEditableSettings: EditableSetting[];
  public form: FormGroup;

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
    private router: Router) {
      this.multivalueMetadataEditableSettings = [
        {name: "areas", key: "AREAS"} ,
        {name: "propertyTypes", key: "PROPERTY_TYPES"} ,
        {name: "sources", key: "SOURCES"} 
      ];

      let translations = [
        'SETTINGS_ITEM_DELETE_CONFIRM', 'GENERAL_CANCEL', 'GENERAL_APPROVE',
        'SETTINGS_ITEM_ADD_TITLE', 'SETTINGS_ITEM_ADD_PLACEHOLDER','GENERAL_ACTION_ERROR',
        'SETTINGS_ITEM_ADD_SUCCESS'];

      this.multivalueMetadataEditableSettings.forEach(x=> translations.push(x.key + "_SINGLE"));

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
      case 'areas':
        this.items = this.userData.areas;
        break;
    }
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

  public gotoSettingsPage(setting: EditableSetting){
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
    let message =   `${this.translations['SETTINGS_ITEM_DELETE_CONFIRM']}${this.translations[singleKey]}`;
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
            switch (setting.name) {
              case "areas":
                  this.removeArea(item);    
                break;
            
              default:
                break;
            }

          },
          cssClass: 'primary'
        }
      ]
    });
    prompt.present();
  }

  private async removeArea(area: Area): Promise<void>{
    let loading = await this.loadingCtrl.create();
    loading.present();
    return this.user.removeArea(area).then(()=>{
      loading.dismiss();
      this.removeFromView(area);
    });
  }

  private async addArea(area: string){
    let loading = await this.loadingCtrl.create();
    loading.present();
    this.user.addArea(area).then(()=>{
      this.items = this.user.getUserData().areas;
      loading.dismiss();
      this.showToast(`"${area}" ${this.translations.SETTINGS_ITEM_ADD_SUCCESS}`);
    }, ()=>{            
      this.showToast(this.translations.GENERAL_ACTION_ERROR);
    });//todo:handle error
  }

  private removeFromView(item: UserSetting){
    this.items.splice(this.items.indexOf(item), 1);   
  }

  public async addItemModal(setting: EditableSetting) {
    let singleKey = `${setting.key}_SINGLE`;
    this.newItemName = "";
   
    const prompt = await this.alertCtrl.create({
      header: `${this.translations["SETTINGS_ITEM_ADD_TITLE"]} ${this.translations[singleKey]}`,
      cssClass: "rtl-modal",
      inputs: [
        {
          name: 'item',
          placeholder: `${this.translations["SETTINGS_ITEM_ADD_PLACEHOLDER"]}${this.translations[singleKey]}`,
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
            if (!data.item){
              return;
            }

            switch (setting.name) {
              case "areas":
                   this.addArea(data.item);
                break;         
              default:
                break;
            }
          }
        }
      ]
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

export class EditableSetting{
  public name: string;
  public key: string;
}
