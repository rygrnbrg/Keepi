import { DealType } from './../../models/lead-property-metadata';
import { Input, Output, EventEmitter } from "@angular/core";
import { Component } from "@angular/core";
import { Settings } from "../../providers";

@Component({
  selector: "budget-slider",
  templateUrl: "budget-slider.html"
})
export class BudgetSliderComponent {
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
  constructor(private settings: Settings) {

  }

  ngOnInit() {
    this.settings.allSettings.then((settings) => {
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
    });
  }
  private initValue(defaultValue: number) {
    if (!this.value) {
      this.value = defaultValue;
      this.valueChanged.emit(this.value);
    }
    this.sliderValue = this.actualToRangeValue(this.value);    
  }

  public onSliderChange(ionRange: any) {
    this.sliderValue = ionRange.value;
    this.value = this.rangeValueToActual(this.sliderValue);
    this.onValueChange();
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
