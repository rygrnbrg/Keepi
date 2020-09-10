import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { User, AuthProvider } from "../providers";
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { environment } from '../environments/environment';
import * as firebase from 'firebase';
import { PipesModule } from 'src/pipes/pipes.module';
import { StoreModule } from '@ngrx/store';
import * as fromApp from './store/app.reducer'
import { LeadsProvider } from 'src/providers/leads/leads.provider';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata.provider';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule, 
    TranslateModule.forRoot({ 
      loader: {  
        provide: TranslateLoader, 
        useFactory: (createTranslateLoader),  
        deps: [HttpClient] 
      } 
    }), StoreModule.forRoot(fromApp.appReducer),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    User,
    AuthProvider,
    NativeStorage,
    PipesModule,
    LeadsProvider,
    LeadPropertyMetadataProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
    firebase.initializeApp(environment.firebase);
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
