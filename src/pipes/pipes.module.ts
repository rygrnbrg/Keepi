import { NgModule } from '@angular/core';
import { NumberFormatPipe } from './number-format/number-format';
import { AvatarPipe } from './avatar/avatar';
import { LeadTypePipe } from './lead-type/lead-type';
import { LeadOptionPipe } from './lead-option/lead-option.pipe';

@NgModule({
    declarations: [NumberFormatPipe,
        AvatarPipe,
        LeadTypePipe,
        LeadOptionPipe],
    imports: [],
    exports: [
        NumberFormatPipe,
        AvatarPipe,
        LeadTypePipe,
        LeadOptionPipe
    ]
})
export class PipesModule { }
