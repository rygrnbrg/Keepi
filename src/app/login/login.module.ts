import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPage } from './login';
import { LoginPageRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    LoginPageRoutingModule,
    FormsModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule { }
