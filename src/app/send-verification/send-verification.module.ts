import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendVerificationPage } from './send-verification';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SendVerificationPage,
  ],
  imports: [
    IonicPageModule.forChild(SendVerificationPage),
    TranslateModule.forChild()
  ],
})
export class SendVerificationPageModule {}
