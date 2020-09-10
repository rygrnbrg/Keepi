import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { firestore } from 'firebase';
import { rangeValue } from 'src/components/range-budget-slider/range-budget-slider';
import { LeadsProvider } from 'src/providers/leads/leads.provider';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata.provider';
import { Lead, Contact } from 'src/models/lead';
import { LeadPropertyType, LeadType, LeadTypeID, DealType, LeadPropertyMetadata } from 'src/models/lead-property-metadata';
import { LeadFilter } from 'src/models/lead-filter';
import { MessagePage } from '../message/message.page';
import { TranslateService } from '@ngx-translate/core';
import { NumberFormatPipe } from 'src/pipes/number-format/number-format';
import { LeadDetailsPage } from '../lead-details/lead-details.page';


@Component({
  selector: 'app-leads-view',
  templateUrl: './leads-view.page.html',
  styleUrls: ['./leads-view.page.scss'],
  providers: [NumberFormatPipe]
})
export class LeadsViewPage implements OnInit {
  public title: string;
  public query: firestore.QuerySnapshot<firestore.DocumentData>;
  public queryLeadsSearchResults: firebase.firestore.DocumentData[];
  public leadsSearchResults: firebase.firestore.DocumentData[];
  public budgetMinMaxValues: rangeValue;
  public budgetValue: rangeValue;
  public selectedLeadType: LeadType;
  public filters: LeadFilter[];
  public leadType: LeadTypeID;
  public showBudgetSlider: boolean = false;
  public dealType: DealType;
  public lead: Lead;
  private translations: any;
  private budgetFilterMetadata: LeadPropertyMetadata;
  public dealTypeStr: string;
  leadTypes: LeadType[];

  constructor(
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
    private leadsProvider: LeadsProvider,
    private modalCtrl: ModalController,
    private translateService: TranslateService,
    private toastCtrl: ToastController) {
    this.translateService.get([
      'LEADS_RECIEVED_MESSAGE']).subscribe(values => {
        this.translations = values;
      });
    this.budgetFilterMetadata = this.leadPropertyMetadataProvider.get().find(x => x.type === LeadPropertyType.Budget);
    this.leadTypes = LeadType.getAllLeadTypes();
  }

  ionViewWillEnter() {
    if (this.leadType !== undefined) {
      this.dealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.leadType);
      this.selectedLeadType = this.leadTypes.find(x => x.id.toLowerCase() === this.leadType.toLowerCase())
    }
  }
  ngOnInit() {
    this.queryLeadsSearchResults = [];
    this.setBudgetMinMaxValues(this.query);
    this.setShowBudgetSlider();
    this.query.forEach(doc => {
      let data = doc.data();
      this.queryLeadsSearchResults.push(data);//add ref to here (breakpoint)
    });
    this.filters = this.filters.filter(x => x.id !== "relevant");
    this.filterLeadsByRange();
  }

  public closePage() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  public async openLeadDetails(item: Lead) {
    let modal = await this.modalCtrl.create({
      component: LeadDetailsPage,
      componentProps: { item: item, disableNavigation: true },
    });

    modal.present();
    modal.onDidDismiss().then(value => {

    });
  }

  public budgetChanged(range: rangeValue) {
    this.budgetValue = range;
    this.filterLeadsByRange();
  }
  private setShowBudgetSlider(): void {
    if (!this.budgetMinMaxValues || !this.filters) {
      this.showBudgetSlider = false;
    }
    else if (this.budgetMinMaxValues.upper === this.budgetMinMaxValues.lower) {
      this.showBudgetSlider = false;
    }
    else {
      this.showBudgetSlider = true;
    }
  }

  private filterLeadsByRange() {
    let leads = this.queryLeadsSearchResults.map(lead => this.leadsProvider.convertDbObjectToLead(lead.data(), this.leadType, lead.ref));
    let filteredQueryResults = leads.filter(x => this.inBudgetRange(x));
    this.leadsSearchResults = this.sortLeads(filteredQueryResults);
  }

  private setBudgetMinMaxValues(querySnapshot: firebase.firestore.QuerySnapshot): void {
    if (!querySnapshot || querySnapshot.size === 0) {
      this.budgetMinMaxValues = { lower: 0, upper: 0 };
      return;
    }

    let range: rangeValue = { lower: 100000000, upper: 0 };
    let budgetFilterId = this.leadPropertyMetadataProvider.get().find(x => x.type === LeadPropertyType.Budget);

    querySnapshot.forEach(doc => {
      let data = doc.data();
      let value = <number>data[budgetFilterId.id];
      if (value < range.lower) {
        range.lower = value;
      }
      if (value > range.upper) {
        range.upper = value;
      }
    });

    this.budgetMinMaxValues = range;
    this.budgetValue = range;
  }

  private sortLeads(leads: Lead[]): Lead[] {
    let sortedLeads = leads.sort((a, b) => {
      if (!a.created || !b.created) {
        return 0;
      }

      return ((<any>b.created)).getTime() - ((<any>a.created)).getTime();
    });

    return sortedLeads;
  }

  private inBudgetRange(lead: Lead) {
    let value = <number>lead[this.budgetFilterMetadata.id];
    return value >= this.budgetValue.lower && value <= this.budgetValue.upper;
  }

  private async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  public async sendMessage() {
    let contacts = this.leadsSearchResults.map((lead: Lead) => new Contact(lead.phone, lead.name));

    let modal = await this.modalCtrl.create({
      component: MessagePage,
      componentProps: { contacts: contacts }
    });
    modal.present();
    modal.onDidDismiss().then(value => {
      if (value.data && value.data.result && value.data.result.success) {
        let result = value.data.result;
        let message = this.translations.LEADS_RECIEVED_MESSAGE.replace("{numberOfLeads}", result.sentCount);
        this.showToast(message);
      }
    });
  }
}
