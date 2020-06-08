import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { LeadsListComponent } from './leads-list/leads-list';
import { PipesModule } from '../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { BudgetSliderComponent } from './budget-slider/budget-slider';
import { FilteredByComponent } from './filtered-by/filtered-by';
import { LeadTypeSelectComponent } from './lead-type-select/lead-type-select';
import { RangeBudgetSliderComponent } from './range-budget-slider/range-budget-slider';
import { CommonModule } from '@angular/common';
import { OnboardingInfoComponent } from './onboarding-info/onboarding-info.component';


@NgModule({
    declarations: [LeadsListComponent,
        BudgetSliderComponent,
        FilteredByComponent,
        LeadTypeSelectComponent,
        RangeBudgetSliderComponent,
        OnboardingInfoComponent],
    imports: [
        TranslateModule.forChild(),
        PipesModule,
        IonicModule,
        CommonModule
    ],
    exports: [LeadsListComponent,
        BudgetSliderComponent,
        FilteredByComponent,
        LeadTypeSelectComponent,
        RangeBudgetSliderComponent,
        OnboardingInfoComponent]
})
export class ComponentsModule { }
