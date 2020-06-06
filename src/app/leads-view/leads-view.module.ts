import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeadsViewPageRoutingModule } from './leads-view-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { LeadsViewPage } from './leads-view.page';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadsViewPageRoutingModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [LeadsViewPage]
})
export class LeadsViewPageModule {}
