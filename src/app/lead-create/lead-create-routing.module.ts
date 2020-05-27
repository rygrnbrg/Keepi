import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadCreatePage } from './lead-create.page';

const routes: Routes = [
  {
    path: '',
    component: LeadCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadCreatePageRoutingModule {}
