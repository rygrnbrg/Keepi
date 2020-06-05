import { CommentType } from './../../models/comment';
import { LeadPropertyMetadataProvider } from './../../providers/lead-property-metadata/lead-property-metadata';
import { LeadType, LeadPropertyType, DealType } from './../../models/lead-property-metadata';
import { LeadFilter } from './../../models/lead-filter';
import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, NavParams, Platform } from '@ionic/angular';
import { LeadsProvider } from '../../providers/leads/leads';
import { Lead, Contact } from '../../models/lead';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../providers';
import { rangeValue } from '../../components/range-budget-slider/range-budget-slider';
import { SmsResult } from '../../models/smsResult';
import { Comment } from '../../models/comment';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { MessagePage } from '../message/message.page';
import { LeadDetailsPage } from '../lead-details/lead-details.page';
import { LeadsFilterPage } from '../leads-filter/leads-filter.page';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  providers: [LeadsProvider, LeadPropertyMetadataProvider]
})

export class LeadsPage implements OnInit {
  private subscriptions: Subscription[];
  public relevantOnly: boolean = true;
  leadsDictionary: { [id: string]: firebase.firestore.DocumentData[] } = {};
  leads: firebase.firestore.DocumentData[];
  queryLeadsSearchResults: firebase.firestore.DocumentData[];
  leadsSearchResults: firebase.firestore.DocumentData[];
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
    private toastCtrl: ToastController,
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
    private user: User,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    private activatedRoute: ActivatedRoute) {
    this.subscriptions = [];
    this.leadTypes = LeadType.getAllLeadTypes();

    let translationSubscription = this.translateService.get([
      'LIST_LOADING_ERROR', 'LEADS_RECIEVED_MESSAGE', 'LEADS_FOUND']).subscribe(values => {
        this.translations = values;
      });
    this.subscriptions.push(translationSubscription);

    this.initLeadType().then(() => {
      this.selectedDealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(this.selectedLeadType.id);
      this.initLeadSubscription();
    });
  }

  ngOnInit() {

  }

  ionViewDidLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private async initLeadType(): Promise<void> {
    this.activatedRoute.data.forEach(data => {
      let paramsLeadTypeId = data.leadType;
      if (paramsLeadTypeId){
        this.selectedLeadType =  this.leadTypes.find(x=>x.id.toLowerCase() === paramsLeadTypeId.toLowerCase())
      }
      else{
        this.selectedLeadType = this.leadTypes[0];
      }
    });    
  }


  private initLeadSubscription() {
    let leadTypeKey = this.selectedLeadType.id.toString().toLowerCase();

    if (this.leadsDictionary[leadTypeKey]) {
      this.leads = this.leadsDictionary[leadTypeKey];
    }
    else {
      this.leadsProvider.get(this.selectedLeadType.id).get().then(
        (res) => {
          let leads = res.docs.map(lead => this.leadsProvider.convertDbObjectToLead(lead.data(), this.selectedLeadType.id));
          this.leadsDictionary[leadTypeKey] = this.sortLeads(leads);
          this.leads = this.leadsDictionary[leadTypeKey];
          //this.loading.dismiss();
        },
        (err) => {
          if (this.user.getUserData() === null) {
            return;
          }

          //this.loading.dismiss();
          console.error(err);
        });
    }
  }

  public async filterLeadsClick() {
    let modal = await this.modalCtrl.create({
      component: LeadsFilterPage,
      componentProps: { filters: this.activeFilters, leadType: this.selectedLeadType }
    });
    modal.present();
    modal.onDidDismiss().then(async value => {
      let data: LeadFilter[] = value.data;

      if (!data) {
        return;
      }
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
            let data = doc.data();
            this.queryLeadsSearchResults.push(data);
          });
          this.filterLeadsByRange();
        }
      ).catch(reason => loading.dismiss());
    });
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

  private async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
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
      if (value.data && value.data.result && value.data.result.success) {
        let result = value.data.result;
        let message = this.translations.LEADS_RECIEVED_MESSAGE.replace("{numberOfLeads}", result.sentCount);
        this.showToast(message);
        this.addMessageSentComments(result.text, leads);
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

  private addMessageSentComments(text: string, leads: firebase.firestore.DocumentData[]) {
    let comment = new Comment(text, new Date(Date.now()), "", CommentType.MessageSent);

    leads.forEach(lead => {
      let convertedLead = this.leadsProvider.convertDbObjectToLead(lead, this.selectedLeadType.id)
      this.leadsProvider.addComment(convertedLead, comment);
    });
  }

  private filterLeadsByRange() {
    let filteredQueryResults = this.queryLeadsSearchResults.filter(x => this.inBudgetRange(x));
    let leads = filteredQueryResults.map(lead => this.leadsProvider.convertDbObjectToLead(lead, this.selectedLeadType.id));
    this.leadsSearchResults = this.sortLeads(leads);
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

  private inBudgetRange(lead: any) {
    let budgetFilterId = this.leadPropertyMetadataProvider.get().find(x => x.type === LeadPropertyType.Budget);
    let value = <number>lead[budgetFilterId.id];
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
    modal.onDidDismiss().then(value => {
      if (value.data && value.data.editedItem) {
        let editedItem = value.data.editedItem;
        this.updateItem(item, editedItem, this.leads);
        this.updateItem(item, editedItem, this.leadsSearchResults);
      }
    });
  }

  private updateItem(item: Lead, editedItem: Lead, leads: any[]) {
    if (leads) {
      let index = leads.indexOf(item);
      if (index > -1) {
        let lead = <Lead>leads[index];
        lead.comments = editedItem.comments;
        lead.relevant = editedItem.relevant;
      }
    }
  }
}
