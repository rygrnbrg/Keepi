import { NgModule } from '@angular/core';
import { NumberFormatPipe } from './number-format/number-format';
import { AvatarPipe } from './avatar/avatar';
import { LeadTypePipe } from './lead-type/lead-type';
import { LeadOptionPipe } from './lead-option/lead-option.pipe';
import { BudgetPerLeadTypePipe } from './budget-per-lead-type/budget-per-lead-type';

@NgModule({
    declarations: [NumberFormatPipe,
        AvatarPipe,
        LeadTypePipe,
        LeadOptionPipe,
        BudgetPerLeadTypePipe],
    imports: [],
    exports: [
        NumberFormatPipe,
        AvatarPipe,
        LeadTypePipe,
        LeadOptionPipe,
        BudgetPerLeadTypePipe
    ]
})
export class PipesModule { }
