import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CallLogPageRoutingModule } from './call-log-routing.module';
import { CallLogPage } from './call-log.page';
import { PipesModule } from 'src/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallLogPageRoutingModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [CallLogPage]
})
export class CallLogPageModule {}
