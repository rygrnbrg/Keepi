import { CommentType } from './../../models/comment';
import { LeadPropertyMetadataProvider } from './../../providers/lead-property-metadata/lead-property-metadata';
import { LeadType, LeadPropertyType, DealType, LeadTypeID } from './../../models/lead-property-metadata';
import { LeadFilter } from './../../models/lead-filter';
import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, NavParams, Platform } from '@ionic/angular';
import { LeadsProvider } from '../../providers/leads/leads';
import { Lead, Contact } from '../../models/lead';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../providers';
import { rangeValue } from '../../components/range-budget-slider/range-budget-slider';
import { Comment } from '../../models/comment';
import { MessagePage } from '../message/message.page';
import { LeadDetailsPage } from '../lead-details/lead-details.page';
import { LeadsFilterPage } from '../leads-filter/leads-filter.page';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  providers: [NavParams]
})

export class LeadsPage implements OnInit {
  private subscriptions: Subscription[];
  public relevantOnly: boolean = true;
  public isModal: boolean = false;
  public enableFiltering = true;
  leadsDictionary: { [id: string]: Lead[] } = {};
  leads: Lead[];
  queryLeadsSearchResults: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[];
  leadsSearchResults: Lead[];
  loading: any;
  translations: any;
  activeFilters: LeadFilter[];
  filterSearchRunning: boolean;
  leadTypes: LeadType[];
  selectedLeadType: LeadType;
  selectedDealType: DealType;
  showBudgetSlider: boolean = false;
  budgetMinMaxValues: rangeValue;
  budgetValue: rangeValue;
  totalLeadCount: number;
  viewLeadCount: number;

  constructor(
    private leadsProvider: LeadsProvider,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
    private activatedRoute: ActivatedRoute,
    private navParams: NavParams) {
    this.subscriptions = [];
    this.leadTypes = LeadType.getAllLeadTypes();

    let translationSubscription = this.translateService.get([
      'LIST_LOADING_ERROR', 'LEADS_RECIEVED_MESSAGE', 'LEADS_FOUND']).subscribe(values => {
        this.translations = values;
      });
    this.subscriptions.push(translationSubscription);

    if (this.navParams.get("enableFiltering") === false) {
      this.enableFiltering = false;
    }

    if (this.navParams.get("isModal") === true) {
      this.isModal = true;
    }
  }

  ngOnInit() {
    this.initLeadType().then(() => {
      this.selectedDealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.selectedLeadType.id);
      let paramsFilters = this.navParams.get("filters");
      if (paramsFilters) {
        this.filterLeads(paramsFilters);
      }
      else {
        this.initLeadSubscription();
      }
    });
  }

  ionViewDidLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public closePage() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  private async initLeadType(): Promise<void> {
    let paramsLeadType = this.navParams.get("leadType");
    if (paramsLeadType) {
      this.selectedLeadType = this.leadTypes.find(x => x.id.toLowerCase() === paramsLeadType.toLowerCase())
      return;
    }
    else{
      this.selectedLeadType = this.leadTypes[0];
    }

    this.activatedRoute.data.forEach(data => {
      let dataLeadTypeId = data.leadType;
      if (dataLeadTypeId) {
        this.selectedLeadType = this.leadTypes.find(x => x.id.toLowerCase() === dataLeadTypeId.toLowerCase())
      }
      else {
        this.selectedLeadType = this.leadTypes[0];
      }
    });
  }


  private async initLeadSubscription() {
    let leadTypeKey = this.selectedLeadType.id.toString().toLowerCase();

    if (this.leadsDictionary[leadTypeKey]) {
      this.leads = this.leadsDictionary[leadTypeKey];
    }
    else {
      this.refreshLeads();
    }
  }

  public async refreshLeads(refresherEvent?: any) {
    let leadTypeKey = this.selectedLeadType.id.toString().toLowerCase();
    let loading;
    
    if (!refresherEvent) {
      loading = await this.loadingCtrl.create();
      loading.present();
    }

    let leadsReference = this.leadsProvider.get(this.selectedLeadType.id);
    if (!leadsReference){
      console.debug(`Leads page:refreshLeads - Cannot refresh leads, leadsReference is ${leadsReference}`);
      return;
    }
    
    leadsReference.get().then(
      (res) => {
        let leads = res.docs.map(lead => this.leadsProvider.convertDbObjectToLead(lead.data(), this.selectedLeadType.id, lead.ref));
        this.leadsDictionary[leadTypeKey] = this.sortLeads(leads);
        this.leads = this.leadsDictionary[leadTypeKey];
      },
      (err) => {
        console.error(err);
      }).finally(() => {
        if (loading) {
          loading.dismiss()
        }
        if (refresherEvent) {
          refresherEvent.target.complete();
        }
      });
  }

  public async filterLeadsClick() {
    let modal = await this.modalCtrl.create({
      component: LeadsFilterPage,
      componentProps: { filters: this.activeFilters, leadType: this.selectedLeadType, relevantOnly: this.relevantOnly }
    });
    modal.present();
    modal.onDidDismiss().then(async value => {
      let data: LeadFilter[] = value.data;
      if (data) {
        this.filterLeads(data);
      }
    });
  }

  private async filterLeads(data: LeadFilter[]) {
    this.queryLeadsSearchResults = []
    let filters = data.filter(item => item.value !== null);
    if (!filters.length) {
      this.activeFilters = null;
      return;
    }

    this.activeFilters = filters;
    this.filterSearchRunning = true;
    let loading = await this.loadingCtrl.create();
    loading.present();
    this.leadsProvider.filter(this.activeFilters, this.selectedLeadType.id).get().then(
      (querySnapshot) => {
        loading.dismiss();
        this.filterSearchRunning = false;
        this.setBudgetMinMaxValues(querySnapshot);
        this.setShowBudgetSlider();
        querySnapshot.forEach(doc => {
          this.queryLeadsSearchResults.push(doc);
        });
        this.filterLeadsByRange();
      }
    ).finally(() => loading.dismiss());
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

  public async sendMessage() {
    let leads = this.activeFilters ? this.leadsSearchResults : this.leads;
    let contacts = leads.map((lead: Lead) => new Contact(lead.phone, lead.name));

    let modal = await this.modalCtrl.create({
      component: MessagePage,
      componentProps: { contacts: contacts }
    });
    modal.present();
    modal.onDidDismiss().then(value => {
      if (value.data && value.data.success) {
        this.addMessageSentComments(value.data.text, leads);
      }
    });
  }

  public budgetChanged(range: rangeValue) {
    this.budgetValue = range;
    this.filterLeadsByRange();
  }

  public leadTypeChanged(leadType: LeadType) {
    this.selectedLeadType = leadType;
    this.selectedDealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.selectedLeadType.id);
    this.initLeadSubscription();
    this.cleanFilters();
  }

  private addMessageSentComments(text: string, leads: Lead[]) {
    let comment = new Comment(text, new Date(Date.now()), "", CommentType.MessageSent);

    leads.forEach(lead => {
      this.leadsProvider.addComment(lead, comment);
    });
  }

  private filterLeadsByRange() {
    let leads = this.queryLeadsSearchResults.map(lead => this.leadsProvider.convertDbObjectToLead(lead.data(), this.selectedLeadType.id, lead.ref));
    let filteredQueryResults = leads.filter(x => this.inBudgetRange(x));
    this.leadsSearchResults = this.sortLeads(filteredQueryResults);
  }

  private setShowBudgetSlider(): void {
    if (!this.budgetMinMaxValues || !this.activeFilters) {
      this.showBudgetSlider = false;
    }
    else if (this.budgetMinMaxValues.upper === this.budgetMinMaxValues.lower) {
      this.showBudgetSlider = false;
    }
    else {
      this.showBudgetSlider = true;
    }
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

  private inBudgetRange(lead: Lead) {
    let value = <number>lead.budget;
    return value >= this.budgetValue.lower && value <= this.budgetValue.upper;
  }

  public cleanFilters() {
    this.activeFilters = null;
    this.showBudgetSlider = false;
  }

  public searchHasNoResults() {
    return (!this.filterSearchRunning) && this.leadsSearchResults && this.leadsSearchResults.length === 0 && this.activeFilters;
  }

  public deleteItem(item: Lead) {
    this.leadsProvider.delete(item);
  }

  public async openLeadDetails(item: Lead) {
    let modal = await this.modalCtrl.create({
      component: LeadDetailsPage,
      componentProps: { item: item }
    });

    modal.present();
    modal.onDidDismiss().then((res) => {
      item.relevant = res.data.relevant;
    });
  }
}
