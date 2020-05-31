import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeadsFilterPageRoutingModule } from './leads-filter-routing.module';
import { LeadsFilterPage } from './leads-filter.page';
import { PipesModule } from 'src/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadsFilterPageRoutingModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [LeadsFilterPage]
})
export class LeadsFilterPageModule {}
