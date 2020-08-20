import { LeadPropertyMetadataProvider } from './../../providers/lead-property-metadata/lead-property-metadata';
import { NumberFormatPipe } from './../../pipes/number-format/number-format';
import { LeadPropertyMetadata, LeadType, LeadTypeID } from './../../models/lead-property-metadata';
import { Input } from '@angular/core';
import { LeadFilter } from './../../models/lead-filter';
import { Component } from '@angular/core';
import { LeadPropertyType } from '../../models/lead-property-metadata';
import { TranslateService } from '@ngx-translate/core';
import { LeadProperty } from 'src/models/LeadProperty';

@Component({
  selector: 'filtered-by',
  templateUrl: 'filtered-by.html',
  providers: [NumberFormatPipe]
})
export class FilteredByComponent {
  @Input()
  public filters: LeadFilter[];
  @Input() 
  public leadType:LeadType;

  public leadTypeIcon:string;
  public leadPropertyType = LeadPropertyType;
  private translations: any;

  constructor(
    public numberFormatPipe: NumberFormatPipe, 
    public translateService: TranslateService,
    leadPropertyMetadataProvider: LeadPropertyMetadataProvider) {
    this.translateService.get([
      'LEAD_RELEVANCE_SHOW_ONLY_RELEVANT_TRUE']).subscribe(values => {
        this.translations = values;
      });
      
      this.leadTypeIcon = leadPropertyMetadataProvider.getBasicLeadProperties().find(x=> x.id === LeadProperty.type).icon;
   }

  ngOnChanges() {
    this.moveAreaLast();
  }

  private moveAreaLast(): void {
    if (!this.filters) {
      return;
    }
    
    this.filters = this.filters.map(x=>Object.assign({}, x));
    let index = this.filters.findIndex(x => x.id === LeadProperty.area);
    if (index > -1) {
      let removed = this.filters.splice(index, 1);
      this.filters.push(removed[0]);
    }
  }

  public getFilterValueString(filter: LeadFilter): string {
    if (filter.id === LeadPropertyMetadataProvider.relevanceKey) {
      if (filter.value === true) {
        return this.translations.LEAD_RELEVANCE_SHOW_ONLY_RELEVANT_TRUE;
      }
    }
    if (!filter.metadata) {
      return "";
    }
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

}
