import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { MessagePageRoutingModule } from './message-routing.module';
import { MessagePage } from './message.page';
import { PipesModule } from 'src/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessagePageRoutingModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [MessagePage]
})
export class MessagePageModule {}
