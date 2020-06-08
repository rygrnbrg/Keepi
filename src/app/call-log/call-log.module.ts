import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CallLogPageRoutingModule } from './call-log-routing.module';
import { CallLogPage } from './call-log.page';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallLogPageRoutingModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [CallLogPage]
})
export class CallLogPageModule {}
