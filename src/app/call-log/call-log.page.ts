import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { CallLog, CallLogObject } from '@ionic-native/call-log/ngx';
import { Caller } from '../../models/caller';
import { Lead } from '../../models/lead';
import { LeadCreatePage } from '../lead-create/lead-create.page';
import { LeadSaveContactPage } from '../lead-save-contact/lead-save-contact.page';
import { Trinary } from 'src/models/trinary';

@Component({
    selector: 'app-call-log',
    templateUrl: './call-log.page.html',
    styleUrls: ['./call-log.page.scss'],
    providers: [CallLog]
})
export class CallLogPage {
    log: Lead[];
    keys: string[];
    public refreshing: boolean;
    private lastLogDate: any;
    private CALL_LOG_DAYS: number = 7;
    private gotCallLogReadPermission: Trinary;

    constructor(
        public navCtrl: NavController,
        private callLog: CallLog,
        private platform: Platform,
        private modalCtrl: ModalController) {
        this.gotCallLogReadPermission = Trinary.Unknown;
        this.updateLog();
    };

    public updateLog(refresherEvent?: any) {
        if (this.platform.is("android") && this.platform.is("hybrid")) {
            if (this.gotCallLogReadPermission === Trinary.Yes) {
                this.refreshAndroidCallLog(refresherEvent);
                return;
            }

            this.hasAndroidPermissions().then(hasPermission => {
                if (hasPermission) {//todo: test when only got fresh permission
                    this.gotCallLogReadPermission = Trinary.Yes;
                    this.refreshAndroidCallLog(refresherEvent);
                }
                else {
                    this.gotCallLogReadPermission = Trinary.No;
                    //todo: show refresh button
                }
            });
        }
        else {
            this.mockLog(refresherEvent);
        }
    }

    private hasAndroidPermissions(): Promise<boolean> {
        return this.callLog.hasReadPermission().then(async hasPermission => {
            if (hasPermission) {
                return true;
            }
            else {
                return this.callLog.requestReadPermission();
            }
        });
    }

    private refreshAndroidCallLog(refresherEvent?: any) {
        if (!refresherEvent) {
            this.refreshing = true;
        }
        this.callLog.getCallLog(this.getLogFilter(this.CALL_LOG_DAYS)).then((result: Caller[]) => {
            if (result && result.length && result[0].date !== this.lastLogDate) {
                this.lastLogDate = result[0].date
                this.log = this.getUniqueCallerLog(result);
            }
        }).finally(() => {
            if (refresherEvent) {
                refresherEvent.target.complete();
            }
            this.refreshing = false;
        });
    }

    private getUniqueCallerLog(log: Caller[]): Lead[] {
        let fullLog = log.map((x) => new Lead(x.number ? x.number : "", x.name ? x.name : ""));

        let uniqueItemsMap = {};
        let uniqueItemsArray = [];

        fullLog.forEach(item => {
            let itemStr = `${item.phone}_${item.name}`;
            if (!uniqueItemsMap[itemStr]) {
                uniqueItemsMap[itemStr] = true;
                uniqueItemsArray.push(item);
            }
        });

        return uniqueItemsArray.slice(0, 50);
    }


    public async addLead(lead?: Lead) {
        if (lead && lead.name && lead.phone) {
            this.gotoLeadCreatePage(lead);
            return;
        }

        let leadToAdd = new Lead("", "");
        if (lead) {
            leadToAdd = new Lead(lead.phone, lead.name);
        }

        let modal = await this.modalCtrl.create({
            component: LeadSaveContactPage,
            componentProps: { lead: leadToAdd }
        });
        modal.present();
        modal.onDidDismiss().then(value => {
            // if (value && value.data && value.data.lead){
            //     lead.name = value.data.lead.name;
            //     lead.phone = value.data.lead.phone;
            //     this.gotoLeadCreatePage(lead);
            // }
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

    private mockLog(refresherEvent?: any) {
        let log: Caller[] = [];
        for (let index = 0; index < 3; index++) {
            log.push(<Caller>{ number: "0528626684" + index });
        }
        for (let index = 0; index < 400; index++) {
            log.push(<Caller>{ number: "0528626684" + index, name: "איש קשר מספר " + index });
            log.push(<Caller>{ number: "0528626684" + index, name: "איש קשר מספר " + index });
        }

        let freshLog = this.getUniqueCallerLog(log);
        this.log = freshLog;

        if (!refresherEvent) {
            this.refreshing = true;
        }
        setTimeout(() => {
            if (refresherEvent) {
                refresherEvent.target.complete();
            }
            this.refreshing = false;
        }, 2000);
    }

}
