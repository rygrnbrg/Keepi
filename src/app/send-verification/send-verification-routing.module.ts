import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendVerificationPage } from './send-verification';

const routes: Routes = [
  {
    path: '',
    component: SendVerificationPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendVerificationPageRoutingModule {}
