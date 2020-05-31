import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CallLog, CallLogObject } from '@ionic-native/call-log/ngx';
import { Caller } from '../../models/caller';
import { Lead } from '../../models/lead';
import { Router } from '@angular/router';
import { LeadCreatePage } from '../lead-create/lead-create.page';
import { TranslateService } from '@ngx-translate/core';
import { LeadSaveContactPage } from '../lead-save-contact/lead-save-contact.page';

@Component({
    selector: 'app-call-log',
    templateUrl: './call-log.page.html',
    styleUrls: ['./call-log.page.scss'],
    providers: [CallLog]
})
export class CallLogPage {
    log: Lead[];
    keys: string[];
    private lastLogDate: any;
    private CALL_LOG_DAYS: number = 5;
    private translations: any;

    constructor(
        public navCtrl: NavController,
        private callLog: CallLog,
        private platform: Platform,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController) {
        this.updateLog();
    };

    public updateLog(refresherEvent?: any) {
        if (this.platform.is("android") && this.platform.is("cordova")) {
            this.handleAndroidCallLog();
        }
        else {//todo: mock remove
            if (!(this.log && this.log.length)) {
                let log: Caller[] = [];
                for (let index = 0; index < 3; index++) {
                    log.push(<Caller>{ number: "0528626684" + index });
                }
                for (let index = 0; index < 10; index++) {
                    log.push(<Caller>{ number: "0528626684" + index, name: "caller" + index });
                }

                let freshLog = this.getUniqueCallerLog(log);
                this.log = freshLog;
            }
            setTimeout(() => {
                console.log('Async operation has ended');
                if (refresherEvent) {
                    refresherEvent.target.complete();
                }
            }, 2000);
        }
    }

    private handleAndroidCallLog(refresherEvent?: any) {
        this.callLog.hasReadPermission().then(async hasPermission => {
            if (hasPermission) {
                let loading: HTMLIonLoadingElement;
                if (!event) {
                    loading = await this.loadingCtrl.create();
                    loading.present();
                }
                this.callLog.getCallLog(this.getLogFilter(this.CALL_LOG_DAYS)).then((result: Caller[]) => {
                    if (loading) {
                        loading.dismiss();
                    }
                    if (refresherEvent) {
                        refresherEvent.target.complete();
                    }
                    if (result && result.length && result[0].date !== this.lastLogDate) {
                        this.lastLogDate = result[0].date
                        this.log = this.getUniqueCallerLog(result);
                    }
                }).catch((reason) => {
                    loading.dismiss();
                });
            }
            else {
                this.callLog.requestReadPermission().then((value) => {
                    this.updateLog(refresherEvent.target.complete());
                });
            }
        });
    }

    private getUniqueCallerLog(log: Caller[]): Lead[] {
        let fullLog = log.slice(0, 20).map((x) => new Lead(x.number ? x.number : "", x.name ? x.name : ""));
        // let uniqueItemsLog: Lead[] = [];

        // fullLog.forEach(item => {
        //   let existingItem = uniqueItemsLog.find(x => x.phone === item.phone);

        //   if (!existingItem) {
        //     uniqueItemsLog.push(item);
        //   }
        //  });

        // return uniqueItemsLog;
        return fullLog;

    }

    public async addLead(lead?: Lead) {
        if (!lead){
            lead = new Lead("","");
        }
        else if (lead.name){
            this.gotoLeadCreatePage(lead);
            return;
        }

        let modal = await this.modalCtrl.create({
            component: LeadSaveContactPage,
            componentProps: { lead: lead }
        });
        modal.present();
        modal.onDidDismiss().then(value => {
            if (value && value.data && value.data.lead){
                lead.name = value.data.lead.name;
                lead.phone = value.data.lead.phone;
                this.gotoLeadCreatePage(lead);
            }
        });
    }

    private async gotoLeadCreatePage(lead: Lead) {
        let modal = await this.modalCtrl.create({
            component: LeadCreatePage,
            componentProps: { lead: lead }
        });
        modal.present();
        modal.onDidDismiss().then(value => {

        });
    }

    private getLogFilter(numberOfDays: number) {
        let logFilter: CallLogObject[] = [{
            "name": "date",
            "value": new Date().setDate(new Date().getDate() - numberOfDays).toString(),
            "operator": ">="
        }];
        return logFilter
    }
}
