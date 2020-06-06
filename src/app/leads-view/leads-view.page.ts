import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { firestore } from 'firebase';
import { rangeValue } from 'src/components/range-budget-slider/range-budget-slider';
import { LeadsProvider } from 'src/providers/leads/leads';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata';
import { Lead } from 'src/models/lead';
import { LeadPropertyType, LeadType, LeadTypeID } from 'src/models/lead-property-metadata';
import { LeadFilter } from 'src/models/lead-filter';


@Component({
  selector: 'app-leads-view',
  templateUrl: './leads-view.page.html',
  styleUrls: ['./leads-view.page.scss'],
  providers: [LeadsProvider, NavParams, LeadPropertyMetadataProvider]
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
  constructor(
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
    private leadsProvider: LeadsProvider,
    private navParams: NavParams,
    private modalCtrl: ModalController) {
    this.filters = this.navParams.get("filters");
    this.query = this.navParams.get("query");
    this.title = this.navParams.get("title");
    this.leadType = this.navParams.get("leadType");
  }


  ngOnInit() {
    this.queryLeadsSearchResults = [];
    this.query.forEach(doc => {
      let data = doc.data();
      this.queryLeadsSearchResults.push(data);
    });
    this.setBudgetMinMaxValues(this.queryLeadsSearchResults);
    this.setShowBudgetSlider();
    this.filterLeadsByRange();
  }
  public closePage() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
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
    let filteredQueryResults = this.queryLeadsSearchResults.filter(x => this.inBudgetRange(x));
    let leads = filteredQueryResults.map(lead => this.leadsProvider.convertDbObjectToLead(lead, this.leadType));
    this.leadsSearchResults = this.sortLeads(leads);
  }

  private setBudgetMinMaxValues(documents: firebase.firestore.DocumentData[]): void {
    if (!documents || documents.length === 0) {
      this.budgetMinMaxValues = { lower: 0, upper: 0 };
      return;
    }

    let range: rangeValue = { lower: 100000000, upper: 0 };
    let budgetFilterId = this.leadPropertyMetadataProvider.get().find(x => x.type === LeadPropertyType.Budget);

    documents.forEach(doc => {
      let value = <number>doc[budgetFilterId.id];
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

  private inBudgetRange(lead: any) {
    let budgetFilterId = this.leadPropertyMetadataProvider.get().find(x => x.type === LeadPropertyType.Budget);
    let value = <number>lead[budgetFilterId.id];
    return value >= this.budgetValue.lower && value <= this.budgetValue.upper;
  }
}
