import { ComponentsModule } from './../../components/components.module';
import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadCreatePageRoutingModule } from './lead-create-routing.module';

import { LeadCreatePage } from './lead-create.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadCreatePageRoutingModule,
    PipesModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [LeadCreatePage]
})
export class LeadCreatePageModule {}
