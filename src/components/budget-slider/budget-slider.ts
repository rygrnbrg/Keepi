import { DealType } from './../../models/lead-property-metadata';
import { Input, Output, EventEmitter, OnInit, SimpleChanges } from "@angular/core";
import { Component } from "@angular/core";
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "budget-slider",
  templateUrl: "budget-slider.html",
})
export class BudgetSliderComponent implements OnInit {
  @Input() public value: number;

  @Input() public set dealType(value: number) {
    if (this._dealType !== value) {
      this._dealType = value;
      this.initSettings();
    }
  }
  @Input() public set commercial(value: number) {
    if (this._commercial !== value) {
      this._commercial = value;
      this.initSettings();
    }
  }

  public get commercial() {
    return this._commercial;
  }
  public get dealType() {
    return this._dealType;
  }

  public sliderMaxValue: number;
  public sliderMinValue: number;
  public maxValue: number;
  public minValue: number;
  public presetBudgets: number[];
  private translations: any;
  private scaleFactor = 10000;
  private _dealType;
  private _commercial;
  public sliderValue: number;

  @Output() valueChanged = new EventEmitter<number>();
  @Output() customValueSelected = new EventEmitter<number>();
  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {
    let translations = ['GENERAL_INPUT', 'GENERAL_CANCEL', 'GENERAL_APPROVE', 'BUDGET_MANUAL_INPUT_TITLE', 'GENERAL_BUDGET_INPUT'];
    this.translate.get(translations).subscribe(values => {
      this.translations = values;
    });
  }

  ngOnInit() {
    this.initSettings()
  }

  private initSettings() {
    var settings = {
      defaultBudget: 1500_000,
      minBudget: 500_000,
      maxBudget: 5000_000,
      presetBudgets: [50_0000, 1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000],
      defaultRentBudget: 4_000,
      minRentBudget: 2_000,
      maxRentBudget: 1_0000,
      presetRentBudgets: [3_500, 4_000, 4_500, 5_000, 5_500, 6_000, 6_500, 7_000, 8_000],
      defaultRentCommercialBudget: 50,
      minRentCommercialBudget: 10,
      maxRentCommercialBudget: 150,
      presetRentCommercialBudgets: [10, 20, 30, 50, 75, 100, 125, 150]
    };

    if (this.dealType === DealType.Sell) {
      this.scaleFactor = 100_000;
      this.maxValue = settings.maxBudget;
      this.minValue = settings.minBudget;
      this.initValue(settings.defaultBudget);
      this.presetBudgets = settings.presetBudgets;
    }
    else {
      if (this.commercial) {
        this.scaleFactor = 1;
        this.maxValue = settings.maxRentCommercialBudget;
        this.minValue = settings.minRentCommercialBudget;
        this.initValue(settings.defaultRentCommercialBudget);
        this.presetBudgets = settings.presetRentCommercialBudgets;
      }
      else {
        this.scaleFactor = 100;
        this.maxValue = settings.maxRentBudget;
        this.minValue = settings.minRentBudget;
        this.initValue(settings.defaultRentBudget);
        this.presetBudgets = settings.presetRentBudgets;
      }
    }
    this.sliderMaxValue = this.actualToRangeValue(this.maxValue);
    this.sliderMinValue = this.actualToRangeValue(this.minValue);
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

  public async manualPriceClick() {
    const prompt = await this.alertCtrl.create({
      header: `${this.translations["BUDGET_MANUAL_INPUT_TITLE"]}`,
      inputs: [{
        name: "budget",
        type: "number",
        placeholder: `${this.translations["GENERAL_BUDGET_INPUT"]}`
      }],
      buttons: [
        {
          text: this.translations.GENERAL_CANCEL,
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: this.translations.GENERAL_APPROVE,
          cssClass: 'primary',
          handler: async data => {
            let newBudget = data["budget"];
            if (newBudget) {
              if (newBudget < this.minValue) {
                this.sliderMinValue = 0;
              }
              if (newBudget > this.maxValue) {
                this.sliderMaxValue = this.actualToRangeValue(newBudget);
              }
              setTimeout(() => {
                this.sliderValue = this.actualToRangeValue(newBudget);
              }, 100);
            }
          }
        }
      ]
    });
    prompt.present();
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
