
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../call-log/call-log.module').then(m => m.CallLogPageModule)
      },
      {

        path: 'tab2',
        //loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
        children: [{
          path: '',
          loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
          data: { leadType: "buyer" }
        },
        {
          path: 'buyer',
          loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
          data: { leadType: "buyer" }
        },
        {
          path: 'seller',
          loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
          data: { leadType: "seller" }
        },
        {
          path: 'tenant',
          loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
          data: { leadType: "tenant" }
        },
        {
          path: 'landlord',
          loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule),
          data: { leadType: "landlord" }
        }
        ]
      },
      {
        path: 'tab3',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
