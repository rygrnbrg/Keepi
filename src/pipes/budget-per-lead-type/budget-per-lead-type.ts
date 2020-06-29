import { LeadTypeID } from '../../models/lead-property-metadata';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'budgetPerLeadType',
})
export class BudgetPerLeadTypePipe implements PipeTransform {
  transform(value: string, leadType: LeadTypeID, commercial: boolean) {
    if (value === undefined) {
      return "";
    }

    if (leadType === undefined){
      return value;
    }

    if (!commercial || leadType === LeadTypeID.Buyer || leadType === LeadTypeID.Seller) {
      return leadType.toString().toUpperCase() + "_BUDGET_TITLE";
    }

    return leadType.toString().toUpperCase() + "_BUDGET_COMMERCIAL_TITLE";
  }
}
