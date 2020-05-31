import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadSaveContactPage } from './lead-save-contact.page';

const routes: Routes = [
  {
    path: '',
    component: LeadSaveContactPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadSaveContactPageRoutingModule {}
