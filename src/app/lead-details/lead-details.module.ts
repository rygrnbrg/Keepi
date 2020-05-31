import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeadDetailsPageRoutingModule } from './lead-details-routing.module';
import { LeadDetailsPage } from './lead-details.page';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadDetailsPageRoutingModule,
    PipesModule, 
    ComponentsModule,
    TranslateModule
  ],
  declarations: [LeadDetailsPage]
})
export class LeadDetailsPageModule {}
