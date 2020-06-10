import { Settings } from './../../providers/settings/settings';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder } from '@angular/forms';
import { IonicModule, NavParams } from '@ionic/angular';
import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  providers: [NavParams, FormBuilder],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
