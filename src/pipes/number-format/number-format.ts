import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number) {
    if (!value){
      return "0";
    }
    if (value >= 1000000){
      return Math.round(value/1000000) + "M";
    }
    if (value >= 100000){
      return Math.round(value/1000) + "K";
    }  
    if (value >= 1000){
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return value.toFixed(0);
  }
}
