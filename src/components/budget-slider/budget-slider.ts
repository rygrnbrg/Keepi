import { DealType } from './../../models/lead-property-metadata';
import { Input, Output, EventEmitter, OnInit, SimpleChanges } from "@angular/core";
import { Component } from "@angular/core";

@Component({
  selector: "budget-slider",
  templateUrl: "budget-slider.html",
})
export class BudgetSliderComponent implements OnInit {
  @Input() public value: number;
  @Input() public dealType: number;

  public sliderMaxValue: number;
  public sliderMinValue: number;
  public maxValue: number;
  public minValue: number;
  public presetBudgets: number[];

  private scaleFactor = 10000;
  private sliderValue: number;

  @Output() valueChanged = new EventEmitter<number>();
  @Output() customValueSelected = new EventEmitter<number>();
  constructor() {

  }

  ngOnInit() {
    var settings =  {
      defaultBudget: 1500000,
      minBudget: 500000,
      maxBudget: 5000000,
      presetBudgets: [500000, 1000000, 1500000, 2000000, 2500000, 3000000],
      defaultRentBudget: 4000,
      minRentBudget: 2000,
      maxRentBudget: 10000,
      presetRentBudgets:[3500,4000,4500,5000,5500,6000,6500,7000,8000]
    };

      if (this.dealType === DealType.Sell) {
        this.scaleFactor = 100000;
        this.maxValue = settings.maxBudget;
        this.minValue = settings.minBudget;
        this.initValue(settings.defaultBudget);
        this.presetBudgets = settings.presetBudgets;
      }
      else {
        this.scaleFactor = 100;
        this.maxValue = settings.maxRentBudget;
        this.minValue = settings.minRentBudget;
        this.initValue(settings.defaultRentBudget);
        this.presetBudgets = settings.presetRentBudgets;
      }
      this.sliderMaxValue = this.actualToRangeValue(this.maxValue);
      this.sliderMinValue = this.actualToRangeValue(this.minValue);
  }

  ngOnChanges(changes: SimpleChanges) {
    let dealTypeChange = changes["dealType"];
    if ( dealTypeChange && dealTypeChange.currentValue !=dealTypeChange.previousValue){
      this.ngOnInit();
    }
  }

  private initValue(defaultValue: number) {
    if (!this.value) {
      this.value = defaultValue;
      this.valueChanged.emit(this.value);
    }
    this.sliderValue = this.actualToRangeValue(this.value);    
  }

  public onSliderChange(ionRange: any) {
    this.sliderValue = ionRange.detail.value;
    this.value = this.rangeValueToActual(this.sliderValue);
    this.onValueChange();
    ionRange.preventDefault();
    ionRange.stopPropagation();
  }

  public setValue(value: number) {
    this.sliderValue = this.actualToRangeValue(value);
    this.customValueSelected.emit(value);
  }

  private rangeValueToActual(value: number): number {
    return value * this.scaleFactor;
  }

  private actualToRangeValue(value: number): number {
    return value / this.scaleFactor;
  }

  private onValueChange() {
    this.valueChanged.emit(this.value);
  }
}
