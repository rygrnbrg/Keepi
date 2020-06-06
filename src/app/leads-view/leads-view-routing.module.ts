import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadsViewPage } from './leads-view.page';

const routes: Routes = [
  {
    path: '',
    component: LeadsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsViewPageRoutingModule {}
