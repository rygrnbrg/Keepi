import { DealType } from './../../models/lead-property-metadata';
import { Input, Output, EventEmitter } from "@angular/core";
import { Component } from "@angular/core";
import { Settings } from "../../providers";

@Component({
  selector: 'range-budget-slider',
  templateUrl: 'range-budget-slider.html'
})
export class RangeBudgetSliderComponent {
  @Input() public value: rangeValue;
  @Input() public minMaxValues: rangeValue;
  @Input() public dealType: number;

  private sliderValue: rangeValue;
  public sliderMinMaxValue: rangeValue;

  private scaleFactor = 10000;


  @Output() valueChanged = new EventEmitter<rangeValue>();

  constructor(private settings: Settings) {

  }

  ngOnInit() {
    this.sliderMinMaxValue = { upper: 0, lower: 0 };
    if (this.dealType === DealType.Sell) {
      this.scaleFactor = 100000;
    }
    else {
      this.scaleFactor = 100;
    }
    this.initValue();
    this.sliderMinMaxValue = this.actualToRangeValue(this.minMaxValues);
  }
  private initValue() {
    if (!this.value) {
      this.value = this.minMaxValues;
      this.valueChanged.emit(this.value);
    }
    this.sliderValue = this.actualToRangeValue(this.value);
  }

  public onSliderChange(ionRange: any) {
    this.sliderValue = ionRange.value;
    this.value = this.rangeValueToActual(this.sliderValue);
    this.onValueChange();
  }

  public setValue(value: rangeValue) {
    this.sliderValue = this.actualToRangeValue(value);
  }

  private rangeValueToActual(value: rangeValue): rangeValue {
    return {
      lower: value.lower * this.scaleFactor,
      upper: value.upper * this.scaleFactor
    };
  }

  private actualToRangeValue(value: rangeValue): rangeValue {
    return {
      lower: value.lower / this.scaleFactor,
      upper: value.upper / this.scaleFactor
    };
  }

  private onValueChange() {
    this.valueChanged.emit(this.value);
  }
}

export class rangeValue {
  lower: number;
  upper: number;
}
