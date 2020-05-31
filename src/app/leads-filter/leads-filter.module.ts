import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadsFilterPageRoutingModule } from './leads-filter-routing.module';

import { LeadsFilterPage } from './leads-filter.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadsFilterPageRoutingModule
  ],
  declarations: [LeadsFilterPage]
})
export class LeadsFilterPageModule {}
