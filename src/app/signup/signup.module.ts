import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';;
import { SignupPageRoutingModule } from './signup-routing.module';
import { FormsModule } from '@angular/forms';
import { SignupPage } from './signup';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    SignupPageRoutingModule,
    FormsModule
  ],
  declarations: [SignupPage]
})
export class SignupPageModule { }
