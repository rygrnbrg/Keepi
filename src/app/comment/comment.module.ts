import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommentPageRoutingModule } from './comment-routing.module';
import { CommentPage } from './comment.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommentPageRoutingModule,
    TranslateModule
  ],
  declarations: [CommentPage]
})
export class CommentPageModule {}
