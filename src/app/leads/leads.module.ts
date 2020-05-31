import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeadsPageRoutingModule } from './leads-routing.module';
import { LeadsPage } from './leads.page';
import { ComponentsModule } from 'src/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadsPageRoutingModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [LeadsPage]
})
export class LeadsPageModule {}
