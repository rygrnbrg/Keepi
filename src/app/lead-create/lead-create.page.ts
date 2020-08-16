import { Component, ViewChild, OnInit } from '@angular/core';
import { Lead } from 'src/models/lead';
import { LeadPropertyMetadata, DealType, LeadPropertyType, PropertyOption, LeadTypeID } from 'src/models/lead-property-metadata';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata';
import { LeadsProvider } from 'src/providers/leads/leads';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController, IonSlides, NavController, NavParams, ModalController } from '@ionic/angular';
import { User } from 'src/providers';
import { LeadProperty } from 'src/models/LeadProperty';
import { LeadOptionPipe } from 'src/pipes/lead-option/lead-option.pipe';
import { NumberFormatPipe } from 'src/pipes/number-format/number-format';

@Component({
    selector: 'app-lead-create',
    templateUrl: './lead-create.page.html',
    styleUrls: ['./lead-create.page.scss'],
    providers: [NumberFormatPipe, LeadPropertyMetadataProvider, LeadsProvider, LeadOptionPipe]
})

export class LeadCreatePage implements OnInit {
    public item: Lead;
    public resultLead: Lead;
    public leadPropertyType = LeadPropertyType;
    public leadPropertiesMetadata: LeadPropertyMetadata[];
    public dealType: number = DealType.Sell;
    public slideOpts: any = {};
    public activeSlide = 0;
    public isSummarySlide = false;
    public dealTypeDescription: string;
    public areasMultiselect: boolean;
    public activeSlideValid: boolean;
    public isCommercial: boolean;
    private submitted = false;
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
        private navCtrl: NavController,
        private navParams: NavParams,
        private modalCtrl: ModalController
    ) {
        let translations = ['GENERAL_CANCEL', 'GENERAL_APPROVE', 'SETTINGS_ITEM_ADD_TITLE', 'GENERAL_ADD_VALUE',
            'SETTINGS_ITEM_ADD_PLACEHOLDER', 'GENERAL_ACTION_ERROR', 'GENERAL_TO_ADD'];
        let editablePropertiesKeys = this.leadPropertyMetadataProvider.get().filter(x => x.editable).map(x => x.stringsKey);
        editablePropertiesKeys.forEach(x => translations.push(x + '_SINGLE'));

        this.translate.get(translations).subscribe(values => {
            this.translations = values;
        });

        this.item = this.navParams.get("lead");

        this.leadPropertiesMetadata = this.leadPropertyMetadataProvider.get().filter(x => !x.hidden);
        this.initSlideOptions();
    }

    public closePage() {
        this.modalCtrl.dismiss();
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
        if (!this.slides) {
            this.activeSlide = 0;
        }
        else {
            let activeIndex = await this.slides.getActiveIndex();
            this.activeSlide = activeIndex;
            this.isSummarySlide =
                this.activeSlide == this.leadPropertiesMetadata.length ?
                    true : false;
        }
        this.setValidity();
    }

    public setValidity(): void {
        if (!this.leadPropertiesMetadata[this.activeSlide]) {
            return;
        }

        if (this.leadPropertiesMetadata[this.activeSlide].mandatory &&
            this.leadPropertiesMetadata[this.activeSlide].options.find(x => x.selected) === undefined) {
            this.activeSlideValid = false;
        }
        else {
            this.activeSlideValid = true;
        }
    }

    public handleContinueClick(): void {
        if (this.isSummarySlide) {
            this.submitSummary();
            return;
        }

        if (this.activeSlideValid) {
            this.goToSlide(this.activeSlide + 1);
        }
    }

    ngOnInit() {
        this.updateAreas();
        this.leadPropertiesMetadata.forEach(slide =>
            LeadPropertyMetadata.reset(slide)
        );
        this.resultLead = new Lead(this.item.phone, this.item.name);
    }

    private updateAreas() {
        this.leadPropertiesMetadata.find(x => x.id == 'area').options =
            this.leadPropertyMetadataProvider.getOptions(LeadProperty.area);
    }

    public addMetersSlide(index: number) {
        let metersId = "meters";

        if (!this.leadPropertiesMetadata.some(x => x.id === metersId)) {
            let data = this.leadPropertyMetadataProvider.get().find(x => x.id === metersId);
            this.leadPropertiesMetadata.splice(index + 1, 0, data);
        }

        this.goToSlide(index + 1);
    }


    public removeMetersSlide(index: number) {
        let metersId = "meters";
        let slide = this.leadPropertiesMetadata.find(x => x.id === metersId);
        if (slide && this.leadPropertiesMetadata.indexOf(slide) === index + 1) {
            this.leadPropertiesMetadata.splice(index + 1, 1);
        }
    }

    answerButtonClick(slide: LeadPropertyMetadata, button: PropertyOption, index: number): void {
        if (slide.type === LeadPropertyType.StringMultivalue) {
            button.selected = !button.selected;
        }
        else {
            button.selected = true;
        }

        this.handleSpecificSlidesBehavior(slide, button, index);

        if (slide.type === LeadPropertyType.StringSingleValue) {
            this.handleSingleValueButtonClick(slide, button);
            this.goToSlide(index + 1);
        }
    }

    private handleSpecificSlidesBehavior(slide: LeadPropertyMetadata, button: PropertyOption, index: number) {
        switch (slide.id) {
            case LeadProperty.type:
                this.resultLead.type = button.id;
                this.dealTypeDescription = button.title;
                this.dealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.resultLead.type);
                if (button.selected && (button.id === LeadTypeID.Buyer || button.id === LeadTypeID.Tenant)) {
                    this.areasMultiselect = true;
                }
                else {
                    this.areasMultiselect = false;
                }
                break;
            case LeadProperty.rooms:
                if (button.title === "מסחרי") {
                    this.isCommercial = true;
                    this.addMetersSlide(index);
                }
                else {
                    this.isCommercial = false;
                    this.removeMetersSlide(index);
                }
                break;
            case LeadProperty.area:
                if (this.areasMultiselect) {

                }
                else {
                    this.handleSingleValueButtonClick(slide, button);
                    this.goToSlide(index + 1);
                }
                break;



            default:
                break;
        }
    }

    public getSlideValueString(property: LeadPropertyMetadata): String {
        let value = LeadPropertyMetadata.getValueString(property);
        if (!value) {
            value = "-";
        }

        return value;
    }

    setBudget(slide: LeadPropertyMetadata, value: number) {
        let transform = this.numberFormatPipe.transform;
        this.resultLead.budget = value;
        slide.value = transform(value);
    }

    setBudgetButton(slide: LeadPropertyMetadata, value: number) {
        this.setBudget(slide, value);
        this.goToSlide(this.activeSlide + 1);
    }

    public async addOptionModal(slide: LeadPropertyMetadata) {
        const prompt = await this.alertCtrl.create({
            header: this.translations["GENERAL_ADD_VALUE"],
            inputs: [{
                name: slide.id,
                placeholder: `${this.translations["SETTINGS_ITEM_ADD_PLACEHOLDER"]} ${this.translations[slide.stringsKey + "_SINGLE"]} ${this.translations["GENERAL_TO_ADD"]}`
            }],
            buttons: [
                { text: this.translations.GENERAL_CANCEL },
                {
                    text: this.translations.GENERAL_APPROVE,
                    handler: async data => {
                        if (data[slide.id]) {
                            this.addPropValue(LeadProperty[slide.id], data[slide.id]);
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    private async addPropValue(prop: LeadProperty, name: string) {
        let loading = await this.loadingCtrl.create();
        loading.present();
        this.user.addSetting(prop, name).then(() => {
            let options = this.leadPropertyMetadataProvider.getOptions(prop);
            let newOption = options.find(x => x.title == name);
            if (prop === LeadProperty.area && this.areasMultiselect) {
                newOption.selected = true;
            }
            else {
                let propMetadata = this.leadPropertiesMetadata.find(x => x.id === prop);
                this.handleSingleValueButtonClick(propMetadata, newOption);
            }
            newOption.selected = true;
            this.leadPropertiesMetadata.find(x => x.id == prop).options.unshift(newOption);
        }, () => {
            this.showToast(this.translations.GENERAL_ACTION_ERROR);
        }).finally(() => loading.dismiss());
    }

    public async submitSummary() {
        if (this.submitted) {
            return;
        }
        this.submitted = true;
        let loading = await this.loadingCtrl.create();
        loading.present();
        this.resultLead.area = this.getSimpleSlideValue("area");
        this.resultLead.property = this.getSimpleSlideValue("property");
        this.resultLead.rooms = this.getSimpleSlideValue("rooms");
        this.resultLead.source = this.getSimpleSlideValue("source");
        this.resultLead.meters = this.getSimpleSlideValue("meters");
        this.leads.add(this.resultLead).then(() => {
            this.modalCtrl.dismiss();
            this.navCtrl.navigateRoot(["tabs/tab2/" + this.resultLead.type.toLowerCase()]);
        }).finally(() => loading.dismiss());//todo: handle exception
    }

    private handleSingleValueButtonClick(slide: LeadPropertyMetadata, button: PropertyOption) {
        slide.options.forEach(item => {
            item.selected = item === button ? true : false;
        });
    }

    private getSlide(propertyId: string) {
        return this.leadPropertiesMetadata.find(slide => slide.id === propertyId);
    }

    public async isSlideActive(slide: LeadPropertyMetadata): Promise<boolean> {
        if (!this.slides) {
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