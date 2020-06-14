import { PropertyOption, LeadPropertyType, DealType, LeadType } from "./../../models/lead-property-metadata";
import { LeadFilter } from "./../../models/lead-filter";
import { LeadPropertyMetadataProvider } from "./../../providers/lead-property-metadata/lead-property-metadata";
import { Component } from "@angular/core";
import { NavParams, ModalController } from "@ionic/angular";
import { LeadPropertyMetadata } from "../../models/lead-property-metadata";
import { NumberFormatPipe } from "../../pipes/number-format/number-format";

@Component({
  selector: 'app-leads-filter',
  templateUrl: './leads-filter.page.html',
  styleUrls: ['./leads-filter.page.scss'],
  providers: [NumberFormatPipe, LeadPropertyMetadataProvider]
})
export class LeadsFilterPage {
  public filters: LeadFilter[];
  public leadPropertyType = LeadPropertyType;
  public leadPropertyMetadata: LeadPropertyMetadata[];
  public dealType: DealType;
  public relevantOnly: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private numberFormatPipe: NumberFormatPipe,
    private navParams: NavParams,
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider
  ) {
    this.leadPropertyMetadata = leadPropertyMetadataProvider.get();
  }

  public getFilterValueString(filter: LeadFilter): string {
    let value = LeadPropertyMetadata.getValueString(filter.metadata, filter.value);
    if (filter.type === LeadPropertyType.Budget) {
      let numberValue = Number.parseInt(value);
      if (!isNaN(numberValue)) {
        return this.getBudgetString(numberValue);
      }
    }

    return value;
  }

  private getBudgetString(value: number): string {
    let transform = this.numberFormatPipe.transform;
    return transform(value).toString();
  }

  public filterClick(filter: LeadFilter) {
    let selected = filter.selected;
    this.filters.forEach(filter => (filter.selected = false));
    filter.selected = !selected;
  }

  public setBudget(filter: LeadFilter, value: number) {
    filter.value = value;
  }

  public handleSingleOptionValueClick(filter: LeadFilter, event: CustomEvent) {
    filter.value = event.detail.value;
    filter.selected = false;
  }

  public handleMultivalueOptionValueClick(filter: LeadFilter, option: PropertyOption, event: CustomEvent) {
    let checkboxValue = event.detail.checked;
    option.selected = checkboxValue;
    let valueResult = filter.metadata.options.filter(option => option.selected).map(option => option.title);
    filter.value = valueResult.length ? valueResult : null;
  }

  ionViewWillEnter() {
    this.filters = this.leadPropertyMetadata.filter(x => x.filterable).map(
      md =>
        <LeadFilter>{
          id: md.id,
          metadata: md,
          selected: false,
          type: md.type,
          value: null
        }
    );

    let paramsfilters: LeadFilter[] = this.navParams.get("filters");
    let leadType: LeadType = this.navParams.get("leadType");
    this.dealType = this.leadPropertyMetadataProvider.getDealTypeByLeadType(leadType.id);
    if (paramsfilters) {
      paramsfilters.forEach(paramFilter => {
        let index = this.filters.findIndex(filter => filter.id === paramFilter.id);
        this.filters[index] = paramFilter;
      });
    }

  }

  public done() {
    if (this.relevantOnly) {
      this.filters.push(
        <LeadFilter>{
          id: LeadPropertyMetadataProvider.relevanceKey,
          metadata: null,
          selected: true,
          type: LeadPropertyType.Boolean,
          value: true
        })
    }

    this.modalCtrl.dismiss(this.filters);
  }

  public closePage() {
    this.modalCtrl.dismiss();
  }
}

