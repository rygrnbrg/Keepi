import { NgModule } from '@angular/core';
import { NumberFormatPipe } from './number-format/number-format';
import { AvatarPipe } from './avatar/avatar';
import { LeadTypePipe } from './lead-type/lead-type';
@NgModule({
	declarations: [NumberFormatPipe,
    AvatarPipe,
    LeadTypePipe],
	imports: [],
	exports: [NumberFormatPipe,
    AvatarPipe,
    LeadTypePipe]
})
export class PipesModule {}
