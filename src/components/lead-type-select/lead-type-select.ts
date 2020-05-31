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
      this.selectedLeadType = this.leadTypes[0];
    }
  }

  public compareWithLeadType(curr: LeadType, compare: LeadType): boolean {
    return curr && compare? curr.id === compare.id : curr === compare;
  }

  public leadTypeChanged(event: CustomEvent): void{
    let leadType: LeadType = event.detail.value;

    if (this.selectedLeadType.id === leadType.id){
      return;
    }

    this.selectedLeadType = leadType;
    this.valueChanged.emit(this.selectedLeadType);
  }
}
