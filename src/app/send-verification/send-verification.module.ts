import { SendVerificationPageRoutingModule } from './send-verification-routing.module';
import { SendVerificationPage } from './send-verification';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    SendVerificationPageRoutingModule
  ],
  declarations: [SendVerificationPage]
})
export class SendVerificationPageModule {}
