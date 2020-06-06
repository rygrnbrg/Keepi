import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },  
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },  
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'sendverification',
    loadChildren: () => import('./send-verification/send-verification.module').then(m => m.SendVerificationPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'call-log',
    loadChildren: () => import('./call-log/call-log.module').then( m => m.CallLogPageModule)
  },
  {
    path: 'lead-create',
    loadChildren: () => import('./lead-create/lead-create.module').then( m => m.LeadCreatePageModule)
  },
  {
    path: 'leads',
    loadChildren: () => import('./leads/leads.module').then( m => m.LeadsPageModule)
  },
  {
    path: 'message',
    loadChildren: () => import('./message/message.module').then( m => m.MessagePageModule)
  },
  {
    path: 'lead-details',
    loadChildren: () => import('./lead-details/lead-details.module').then( m => m.LeadDetailsPageModule)
  },
  {
    path: 'comment',
    loadChildren: () => import('./comment/comment.module').then( m => m.CommentPageModule)
  },
  {
    path: 'leads-filter',
    loadChildren: () => import('./leads-filter/leads-filter.module').then( m => m.LeadsFilterPageModule)
  },
  {
    path: 'lead-save-contact',
    loadChildren: () => import('./lead-save-contact/lead-save-contact.module').then( m => m.LeadSaveContactPageModule)
  },
  {
    path: 'leads-view',
    loadChildren: () => import('./leads-view/leads-view.module').then( m => m.LeadsViewPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
