import { LeadTypeID } from './../../models/lead-property-metadata';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadType',
})
export class LeadTypePipe implements PipeTransform {
  transform(value: LeadTypeID) {
    return value.toString().toUpperCase() + "_ACTION";
  }
}
