import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadsFilterPage } from './leads-filter.page';

const routes: Routes = [
  {
    path: '',
    component: LeadsFilterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsFilterPageRoutingModule {}
