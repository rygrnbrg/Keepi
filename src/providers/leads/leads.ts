import { LeadTypeID, LeadType } from './../../models/lead-property-metadata';
import { LeadPropertyMetadataProvider } from './../lead-property-metadata/lead-property-metadata';
import { LeadFilter } from "./../../models/lead-filter";
import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit, OnDestroy } from "@angular/core";
import { Lead } from "../../models/lead";
import { User } from "..";
import { firestore } from "firebase";
import { LeadPropertyType, DealType } from "../../models/lead-property-metadata";
import { Comment } from '../../models/comment';
import * as firebase from 'firebase/app';
import { UserData } from '../user/models';
import * as _ from "lodash";
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';

/*
  Generated class for the LeadsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LeadsProvider {
  private leadsDictionary: { [id: string]: firestore.CollectionReference<firestore.DocumentData> } = {};
  private userDataUpdateSubscription: Subscription;

  private static standardLeadKeys = [
    "name",
    "phone",
    "created",
    "budget",
    "area",
    "property",
    "rooms",
    "meters",
    "source"
  ];

  constructor(public http: HttpClient, private leadPropertyMetadataProvider: LeadPropertyMetadataProvider, private store: Store<AppState>) {

  }

  public initLeads() {
    this.subscribeToUserDataUpdate();
  }

  private subscribeToUserSettingsUpdate() {
    this.store.select(x => x.User.Settings).subscribe(settings => {

    });
  }

  private subscribeToUserDataUpdate() {
    if (!this.userDataUpdateSubscription) {
      this.userDataUpdateSubscription = this.store.select(x => x.User.Data).subscribe((userData: UserData) => {
        this.initLeadCollections(userData);
      });
    }
  }

  private initLeadCollections(userData: UserData) {
    LeadType.getAllLeadTypes().forEach(leadType => {
      let leadsCollectionRef =
        firebase.firestore().collection("users").doc(userData.email)
          .collection("leads_" + leadType.id.toString().toLowerCase());
      this.leadsDictionary[leadType.id.toString()] = leadsCollectionRef;
    });
  }

  public get(leadTypeId: LeadTypeID): firebase.firestore.Query {
    let collectionReference = this.leadsDictionary[leadTypeId.toString()];

    if (!collectionReference) {
      console.debug(`leads provider:get - Cannot get leads, collection reference is ${collectionReference}`)
      return null;
    }

    return collectionReference.orderBy("created", "desc").limit(300);
  }

  /**
  * Filter function does not support range values. Range values in consumer code.
  * Multivalue will support only list with 1 item.
  */
  public filter(filters: LeadFilter[], leadTypeId: LeadTypeID): firebase.firestore.Query {
    let query: firebase.firestore.Query = this.leadsDictionary[leadTypeId.toString()];

    // query = this.addBudgetFilter(filters, query);
    query = this.addRelevanceFilter(filters, query);
    query = this.addStringFilters(filters, query);
    query = this.addMultivalueFilters(filters, query);

    return query;
  }

  public updateLeadRelevance(item: Lead, isRelevant: boolean): Promise<void> {
    if (item.relevant === isRelevant) {
      return;
    }

    let data = {};
    data[LeadPropertyMetadataProvider.relevanceKey] = isRelevant;
    return item.ref.update(data);
  }

  public addComment(item: Lead, comment: Comment): Promise<void> {
    let comments = _.clone(item.comments);
    comments.push(comment);

    let data = {};
    data[LeadPropertyMetadataProvider.commentKey] = comments.map(comment => this.getCommentDbObject(comment));
    return item.ref.update(data);
  }

  public convertDbObjectToLead(item: firebase.firestore.DocumentData, leadType: LeadTypeID, ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>): Lead {
    let lead = <Lead>{};
    lead.ref = ref;
    LeadsProvider.standardLeadKeys.forEach(key => (lead[key] = item[key]));
    lead.type = leadType;
    lead.relevant = item[LeadPropertyMetadataProvider.relevanceKey];

    let comments = <Object[]>item[LeadPropertyMetadataProvider.commentKey];
    lead.comments = comments && comments.map ?
      comments.map(comment => new Comment(comment["text"], this.convertDbDateToDate(comment["date"]), comment["title"], comment["commentType"]))
      : [];

    let created = item["created"];
    if (created) {
      lead.created = this.convertDbDateToDate(created);
    }
    return lead;

  }

  private convertDbDateToDate(dbDate: any) {
    if (!dbDate) {
      console.error(`leads provider - convertDbDateToDate - expected db date but got ${dbDate}`)
      return null;
    }
    return new Date(dbDate.seconds * 1000 + dbDate.nanoseconds / 1000);
  }

  public add(item: Lead): Promise<firestore.DocumentReference> {
    let dbObject = this.getLeadDbObject(item);
    return this.leadsDictionary[item.type.toString()].add(dbObject);
  }

  public delete(item: Lead) {

  }

  private addBudgetFilter(filters: LeadFilter[], query: firebase.firestore.Query): firebase.firestore.Query {
    let dealType = this.leadPropertyMetadataProvider.getDealType(filters.map(filter => filter.metadata));
    let range = dealType === DealType.Sell ? 200000 : 1500;
    filters
      .filter(filter => filter.metadata.type === LeadPropertyType.Budget)
      .forEach(filter => {
        if (filter.value) {
          query = query
            .where("budget", "<=", filter.value + range)
            .where("budget", ">=", filter.value - range);
        }
      });

    return query;
  }

  private addRelevanceFilter(filters: LeadFilter[], query: firebase.firestore.Query): firebase.firestore.Query {
    let relevanceFilter = filters.find(x => x.id === LeadPropertyMetadataProvider.relevanceKey)
    if (relevanceFilter) {
      query = query.where(LeadPropertyMetadataProvider.relevanceKey, "==", relevanceFilter.value);
    }
    return query;
  }

  private addStringFilters(filters: LeadFilter[], query: firebase.firestore.Query): firebase.firestore.Query {
    filters
      .filter(
        filter => filter.metadata && filter.metadata.type === LeadPropertyType.StringSingleValue
      )
      .forEach(filter => {
        if (filter.value) {
          query = query.where(filter.id, "==", filter.value);
        }
      });

    return query;
  }

  private addMultivalueFilters(filters: LeadFilter[], query: firebase.firestore.Query): firebase.firestore.Query {
    filters
      .filter(
        filter => filter.metadata && filter.metadata.type === LeadPropertyType.StringMultivalue
      )
      .forEach(filter => {
        if (filter.value && filter.value.length > 0) {
          query = query.where(filter.id, "array-contains-any", filter.value);
        }
      });

    return query;
  }
  private getLeadDbObject(item: Lead): Object {
    let leadObj = {};
    leadObj[LeadPropertyMetadataProvider.relevanceKey] = true;
    LeadsProvider.standardLeadKeys.forEach(key => (leadObj[key] = item[key]));
    return leadObj;
  }

  private getCommentDbObject(item: Comment): Object {
    let commentObj = { title: item.title, text: item.text, commentType: item.commentType, date: item.date };
    return commentObj;
  }
}
