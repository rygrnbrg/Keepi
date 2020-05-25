import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeadType } from '../../models/lead-property-metadata';

@Component({
  selector: 'lead-type-select',
  templateUrl: 'lead-type-select.html'
})
export class LeadTypeSelectComponent {
  leadTypes: LeadType[];
  selectedLeadType: LeadType;

  @Input() public value: LeadType;
  @Input() public label: string;
  @Input() public dropdownSelect: boolean;
  @Input() public iconsView: boolean;

  @Output() valueChanged = new EventEmitter<LeadType>();
  constructor() {

  }
  ngOnInit() {
    this.leadTypes = LeadType.getAllLeadTypes();
    if (this.value) {
      let val = this.leadTypes.find(x => x.id === this.value.id);
      this.selectedLeadType = val;
    }
    else {
      //this.selectedLeadType = this.leadTypes[0];
    }
  }

  public compareWithLeadType(currentValue: LeadType, compareValue: LeadType): boolean {
    return currentValue.id === compareValue.id;
  }

  public leadTypeChanged(leadType: LeadType) {
    this.selectedLeadType = leadType;
    this.valueChanged.emit(this.selectedLeadType);
  }
}
