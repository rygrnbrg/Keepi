import { Pipe, PipeTransform } from '@angular/core';
import { LeadProperty } from 'src/models/LeadProperty';

@Pipe({
  name: 'leadOption'
})
export class LeadOptionPipe implements PipeTransform {

  transform(value: string, prop: LeadProperty): string {
    if (value === null || value === undefined ||value.length === 0){
      return "";
    }
    
    switch (prop) {
      case LeadProperty.meters:
        return this.getRangeFormat(value);
      case LeadProperty.rooms:
      return this.getFigureFormat(value);
      default:
        return value;
    }
  }

  private getFigureFormat(value: string) {
    if (value.indexOf("+")> -1) {
      return `${this.transformNumber(value.replace('+',''))} ומעלה`;
    }
    return value;
  }

  private getRangeFormat(value: string) {
    let values = value.split("_");
    if (values.length !== 2) {
      console.error("Range is not in the correct format of '[bottom]_[top]'");
      return value;
    }
    let bottom = values[0];
    let top = values[1];

    if (top === "+") {
      return `${this.transformNumber(bottom)} ומעלה`;
    }

    if (bottom === "0") {
      return `עד ${this.transformNumber(top)}`;
    }


    return `${this.transformNumber(bottom)} - ${this.transformNumber(top)}`
  }
  private transformNumber(value: number | string): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
