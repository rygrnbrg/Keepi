import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Lead } from 'src/models/lead';
import { LeadPropertyMetadata, DealType, LeadPropertyType, PropertyOption, LeadType } from 'src/models/lead-property-metadata';
import { NumberFormatPipe } from 'src/pipes/number-format/number-format';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata';
import { LeadsProvider } from 'src/providers/leads/leads';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController, IonSlides, NavController } from '@ionic/angular';
import { User } from 'src/providers';

@Component({
    selector: 'app-lead-create',
    templateUrl: './lead-create.page.html',
    styleUrls: ['./lead-create.page.scss'],
    providers: [NumberFormatPipe, LeadPropertyMetadataProvider, LeadsProvider]
})

export class LeadCreatePage {
    public item: Lead;
    public resultLead: Lead;
    public leadPropertyType = LeadPropertyType;
    public leadPropertiesMetadata: LeadPropertyMetadata[];
    public dealType: number = DealType.Sell;
    public slideOpts: any = {};
    public activeSlide = 0;
    public isSummarySlide = false;
    private newAreaName: string;
    private translations: any;

    @ViewChild(IonSlides) slides: IonSlides;

    constructor(
        private numberFormatPipe: NumberFormatPipe,
        private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
        private leads: LeadsProvider,
        private translate: TranslateService,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private user: User,
        private toastCtrl: ToastController,
        private route: ActivatedRoute,
        private navCtrl: NavController
    ) {
        this.translate.get([
            'GENERAL_CANCEL', 'GENERAL_APPROVE', 'SETTINGS_AREAS_ADD_TITLE',
            'SETTINGS_AREAS_ADD_PLACEHOLDER', 'GENERAL_ACTION_ERROR',
            'SETTINGS_AREAS_ADD_SUCCESS']).subscribe(values => {
                this.translations = values;
            });
        this.route.queryParams.subscribe(params => {
            //this.item = params.item;
            this.item = <Lead>{ name: "ישראל ישראלי", phone: "0528626684" };
        });

        this.leadPropertiesMetadata = this.leadPropertyMetadataProvider.get().filter(x => !x.hidden);
        this.initSlideOptions();
    }

    private initSlideOptions() {
        this.slideOpts = {
            speed: 200,
            spaceBetween: 8
        };
    }

    public goToSlide(index: number) {
        setTimeout(() => {
            this.slides.slideTo(index);
        }, 300);
    }

    public async setActiveSlide(event) {
        if (!this.slides){
            this.activeSlide = 0;
            return;
        }

        let activeIndex = await this.slides.getActiveIndex();
        this.activeSlide = activeIndex;
        this.isSummarySlide = 
            this.activeSlide == this.leadPropertiesMetadata.length?
            true: false;
    }

    ionViewDidLoad() {
        this.updateAreas();
        this.leadPropertiesMetadata.forEach(slide =>
            LeadPropertyMetadata.reset(slide)
        );
        this.resultLead = new Lead(this.item.phone, this.item.name, this.item.type);
        this.dealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.item.type);
    }

    private updateAreas() {
        this.leadPropertiesMetadata.find(x => x.id == 'area').options =
            this.leadPropertyMetadataProvider.getAreasOptions();
    }

    public addMetersSlide(index: number) {
        let metersId = "meters";

        if (!this.leadPropertiesMetadata.some(x => x.id === metersId)) {
            let data = this.leadPropertyMetadataProvider.get().find(x => x.id === metersId);
            this.leadPropertiesMetadata.splice(index + 1, 0, data);
        }

        this.goToSlide(index + 1);
    }

    answerButtonClick(slide: LeadPropertyMetadata, button: PropertyOption, index: number): void {
        button.selected = !button.selected;

        if (slide.type === LeadPropertyType.StringSingleValue) {
            this.handleSingleValueButtonClick(slide, button);
            this.goToSlide(index + 1);
        }
    }

    public getSlideValueString(property: LeadPropertyMetadata): String {
        let value = LeadPropertyMetadata.getValueString(property);
        if (!value) {
            value = "-";
        }

        return value;
    }

    setBudget(slide: LeadPropertyMetadata, value: number, index?: number) {
        let transform = this.numberFormatPipe.transform;
        this.resultLead.budget = value;
        slide.value = transform(value);
    }

    public async addAreaModal() {
        this.newAreaName = "";
        const prompt = await this.alertCtrl.create({
            header: this.translations.SETTINGS_AREAS_ADD_TITLE,
            cssClass: "rtl-modal",
            inputs: [
                {
                    name: 'area',
                    placeholder: this.translations.SETTINGS_AREAS_ADD_PLACEHOLDER,
                    value: this.newAreaName
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
                        if (!data.area) {
                            return;
                        }

                        let loading = await this.loadingCtrl.create();
                        loading.present()
                        this.user.addArea(data.area).then(() => {
                            let areasOptions = this.leadPropertyMetadataProvider.getAreasOptions();
                            let newOption = areasOptions.find(x => x.title == data.area);
                            newOption.selected = true;
                            this.leadPropertiesMetadata.find(x => x.id == 'area').options.unshift(newOption);
                            this.user.getUserData().areas;
                            loading.dismiss();
                        }, () => {
                            this.showToast(this.translations.GENERAL_ACTION_ERROR);
                        });//todo:handle error
                    }
                }
            ]
        });
        prompt.present();
    }

    public async submitSummary() {
        let loading = await this.loadingCtrl.create();
        loading.present();
        this.resultLead.area = this.getSimpleSlideValue("area");
        this.resultLead.property = this.getSimpleSlideValue("property");
        this.resultLead.rooms = this.getSimpleSlideValue("rooms");
        this.resultLead.source = this.getSimpleSlideValue("source");
        this.resultLead.meters = this.getSimpleSlideValue("meters");
        this.leads.add(this.resultLead).then(() => {
            loading.dismiss();
            this.navCtrl.navigateRoot(["TabsPage", { tab: "LeadsPage", params: { leadType: new LeadType(this.resultLead.type) } }]);
        });
    }

    private handleSingleValueButtonClick(slide: LeadPropertyMetadata, button: PropertyOption) {
        if (button.selected) {
            slide.options.forEach(item => {
                item.selected = item === button ? true : false;
            });
        }
    }
    private getSlide(propertyId: string) {
        return this.leadPropertiesMetadata.find(slide => slide.id === propertyId);
    }

    public async isSlideActive(slide: LeadPropertyMetadata): Promise<boolean> {
        if (!this.slides){
            return false;
        }
        
        let slideIndex = this.leadPropertiesMetadata.indexOf(slide);
        let activeIndex = await this.slides.getActiveIndex()
        return activeIndex === slideIndex;
    }

    private getSimpleSlideValue(propertyId: string): any {
        let propertyMetadata = this.leadPropertiesMetadata.find(
            prop => prop.id === propertyId
        );

        let slide = this.getSlide(propertyId);

        if (!slide) {
            return null;
        }

        let slideValues = this.getSlide(propertyId)
            .options.filter(button => button.selected)
            .map(button => button.title);

        switch (propertyMetadata.type) {
            case LeadPropertyType.StringSingleValue:
                if (slideValues.length === 1) {
                    return slideValues[0];
                }
                break;
            case LeadPropertyType.StringMultivalue:
                return slideValues;
        }

        return null;
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