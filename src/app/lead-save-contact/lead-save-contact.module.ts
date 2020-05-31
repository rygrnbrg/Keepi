import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadSaveContactPageRoutingModule } from './lead-save-contact-routing.module';

import { LeadSaveContactPage } from './lead-save-contact.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadSaveContactPageRoutingModule
  ],
  declarations: [LeadSaveContactPage]
})
export class LeadSaveContactPageModule {}
