import { Contact } from './../../models/lead';
import { LeadsProvider } from './../../providers/leads/leads';
import { Component, OnInit } from "@angular/core";
import { NavParams, ToastController, ModalController, AlertController, Platform } from "@ionic/angular";
import { LeadPropertyMetadataProvider } from "../../providers/lead-property-metadata/lead-property-metadata";
import { LeadPropertyMetadata, LeadPropertyType, LeadType, LeadTypeID } from "../../models/lead-property-metadata";
import { Lead } from "../../models/lead";
import { AvatarPipe } from "../../pipes/avatar/avatar";
import { NumberFormatPipe } from "../../pipes/number-format/number-format";
import { TranslateService } from '@ngx-translate/core';
import { SmsResult } from '../../models/smsResult';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Subscription } from 'rxjs';
import { Comment, CommentType } from '../../models/comment';
import { firestore } from 'firebase';
import { MessagePage } from '../message/message.page';
import { CommentPage } from '../comment/comment.page';
import { LeadFilter } from 'src/models/lead-filter';
import { LeadProperty } from 'src/models/LeadProperty';
import { DocumentData } from '@google-cloud/firestore';

@Component({
  selector: 'app-lead-details',
  templateUrl: './lead-details.page.html',
  styleUrls: ['./lead-details.page.scss'],
  providers: [AvatarPipe, CallNumber, LeadPropertyMetadataProvider, LeadsProvider, NumberFormatPipe]
})
export class LeadDetailsPage implements OnInit {
  public item: Lead;
  public properties: ItemProperty[];
  public relevant: boolean;
  public dealCount: number;
  public oppositeLeadType: LeadTypeID;
  public singleLeadMatch: DocumentData;
  private translations: any;
  private leadPropertiesMetadata: LeadPropertyMetadata[];
  private subscriptions: Subscription[];

  constructor(
    navParams: NavParams,
    private leadPropertyMetadataProvider: LeadPropertyMetadataProvider,
    private toastCtrl: ToastController,
    private leadsProvider: LeadsProvider,
    private numberFormatPipe: NumberFormatPipe,
    private translateService: TranslateService,
    private modalCtrl: ModalController,
    private callNumber: CallNumber,
    private alertCtrl: AlertController,
    private platform: Platform,
  ) {
    this.leadPropertiesMetadata = this.leadPropertyMetadataProvider.get();
    let item = navParams.get("item");
    this.loadItem(item);
    // this.refreshItem();
  }

  ngOnInit() {
    let backButtonSubscription = this.platform.backButton.subscribe(() => this.closePage());
    this.subscriptions = [];

    let translationSubscription = this.translateService.get([
      'GENERAL_ACTION_ERROR', 'LEADS_RECIEVED_MESSAGE', 'ITEM_CREATE_TYPE_SELECT_TITLE',
      'BUYER_ACTION', 'SELLER_ACTION', 'TENANT_ACTION', 'LANDLORD_ACTION']).subscribe(values => {
        this.translations = values;
      });

    this.subscriptions.push(translationSubscription, backButtonSubscription);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public potentialDealMatchesClick(){
    if (this.dealCount <= 0){
      return;
    }

    
  }

  public async sendMessage(): Promise<void> {
    let leads = [this.item];
    let contacts = leads.map((lead: Lead) => new Contact(lead.phone, lead.name));

    let modal = await this.modalCtrl.create({
      component: MessagePage,
      componentProps: { contacts: contacts }
    });
    modal.present();
    modal.onDidDismiss().then(value => {
      if (value && value.data && value.data.success) {
        let result: SmsResult = value.data;
        let message = this.translations.LEADS_RECIEVED_MESSAGE.replace("{numberOfLeads}", result.sentCount);
        this.showToast(message);
        this.addMessageSentComments(result.text).then(() => {
          this.refreshItem();
        });
      }
    });
  }

  public async addNote(): Promise<void> {
    let modal = await this.modalCtrl.create({
      component: CommentPage,
      componentProps: { lead: this.item }
    });

    modal.present();
    modal.onDidDismiss().then(value => {
      let result = value.data;
      if (result && result.success) {
        console.log("Comment added successfully")
        this.refreshItem();
      }
      else {
        console.log("Failed to add comment");
      }
    });
  }

  public getCommentTitle(comment: Comment) {
    switch (comment.commentType) {
      case CommentType.MessageSent:
        return 'MESSAGE_SENT_TITLE';
      case CommentType.UserComment:
        return '';
      default:
        return '';
    }
  }

  public getComments(comments: Comment[]) {
    return comments.filter(x => x.commentType == CommentType.UserComment);
  }

  public getMessages(comments: Comment[]) {
    return comments.filter(x => x.commentType == CommentType.MessageSent);
  }

  public closePage() {
    this.modalCtrl.dismiss(this.item);
  }

  public getLeadTypeActionLabel(): string {
    return LeadType.getAllLeadTypes().find(x => x.id == this.item.type).actionTranslation
  }

  public call(): void {
    this.callNumber.callNumber(this.item.phone, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  public relevantChanged(): void {
    this.leadsProvider.updateLeadRelevance(this.item, this.relevant).then(() => {
      this.item.relevant = this.relevant;
    }).catch(() => {
      this.showToast(this.translations.GENERAL_ACTION_ERROR);
      this.relevant = this.item.relevant;
    });
  }

  private loadItem(item: Lead) {
    this.item = item;
    this.oppositeLeadType = this.leadPropertyMetadataProvider.getOppositeLeadType(this.item.type);
    this.properties = this.getProperties();
    this.relevant = this.item.relevant;
    this.setPotentialDealCount();
  }

  private refreshItem() {
    let promise = this.leadsProvider.getQuerySnapshotPromise(this.item);
    promise.then((querySnapshot) => {
      querySnapshot.forEach((x: firestore.QueryDocumentSnapshot) => {
        let lead = this.leadsProvider.convertDbObjectToLead(x.data(), this.item.type);
        this.loadItem(lead);
      });
    });
  }

  private getProperties(): ItemProperty[] {
    let props: ItemProperty[] = [];
    this.leadPropertiesMetadata.filter(x => x.id !== 'type').forEach(item => {
      props.push({
        icon: item.icon,
        title: item.title,
        value: this.getPropertyString(item)
      });
    });

    return props;
  }

  private async showToast(message: string): Promise<void> {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  private async addMessageSentComments(text: string): Promise<void> {
    let comment = new Comment(text, new Date(Date.now()), "", CommentType.MessageSent);

    let convertedLead = this.leadsProvider.convertDbObjectToLead(this.item, this.item.type)
    return await this.leadsProvider.addComment(convertedLead, comment);
  }

  private getPropertyString(property: LeadPropertyMetadata): string {
    switch (property.type) {

      case LeadPropertyType.Budget:
        return this.getBudget(this.item.budget);

      case LeadPropertyType.StringMultivalue:
        let value: string[] = this.item[property.id];
        return value.join(", ");

      default:
        return this.item[property.id];
    }
  }

  public async openComment(comment: Comment) {
    const prompt = await this.alertCtrl.create({
      message: comment.text
    });
    prompt.present();
  }

  private getBudget(value: number): string {
    let transform = this.numberFormatPipe.transform;
    return transform(value).toString();
  }

  private async setPotentialDealCount() {
    let filters: LeadFilter[];
    filters = [
      new LeadFilter(LeadProperty.property, LeadPropertyType.StringSingleValue, this.item.property),
      new LeadFilter(LeadProperty.rooms, LeadPropertyType.StringSingleValue, this.item.rooms),
      // new LeadFilter(LeadProperty.area, LeadPropertyType.StringSingleValue, this.item.area)
    ];
    this.dealCount = -1;
    this.leadsProvider.filter(filters, this.oppositeLeadType).get().then(
      (querySnapshot) => {       
        setTimeout(() => {
          if (querySnapshot.size === 1){
            let lead = querySnapshot.docs[0].data();
            this.singleLeadMatch = lead;
          }
          this.dealCount = querySnapshot.size;
        }, 1000);
      }
    ).catch();
  }
}

export interface ItemProperty {
  icon: string;
  title: string;
  value: any;
}
