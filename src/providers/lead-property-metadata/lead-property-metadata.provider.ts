import { DealType, LeadTypeID } from '../../models/lead-property-metadata';
import { LeadPropertyType } from '../../models/lead-property-metadata';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { PropertyOption, LeadPropertyMetadata } from '../../models/lead-property-metadata'
import * as _ from "lodash";
import { LeadProperty } from 'src/models/LeadProperty';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { UserSettings } from '../user/models';
import { Subscription, Observable, forkJoin, from } from 'rxjs';
import { filter, map, concatMap, mergeMap, finalize, take } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import * as leadPropertyMetadataActions from './store/lead-property-metadata.actions';

@Injectable()
export class LeadPropertyMetadataProvider implements OnInit, OnDestroy {
  private properties: LeadPropertyMetadata[] = [];
  private subscriptions: Subscription[] = [];
  private userSettings: UserSettings;
  public static relevanceKey = "relevant";
  public static commentKey = "comment";

  constructor(private store: Store<AppState>) {

  }

  ngOnInit() {
    this.initProperties();
    this.subscribeToUserSettingsUpdate();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  private subscribeToUserSettingsUpdate() {
    let subscription = this.store.select(state => state.User)
      .pipe(filter(x => !isNullOrUndefined(x?.Settings)))
      .pipe(map(x => x.Settings))
      .subscribe((settings: UserSettings) => {
        this.userSettings = settings;
      })

    this.subscriptions.push(subscription);
  }

  private initProperties() {
    let optionsToInit = [LeadProperty.property, LeadProperty.rooms, LeadProperty.meters, LeadProperty.area, LeadProperty.source]
    this.properties = this.getBasicLeadProperties();

    this.properties.find(x => x.id === LeadProperty.type).options = [
      new PropertyOption("לרכוש", false, LeadTypeID.Buyer),
      new PropertyOption("למכור", false, LeadTypeID.Seller),
      new PropertyOption("לשכור", false, LeadTypeID.Tenant),
      new PropertyOption("להשכיר", false, LeadTypeID.Landlord)
    ];

    let optionsToObserve$ = from(optionsToInit).pipe(
      mergeMap(prop =>
        this.options(prop)
          .pipe(map(options => {
            return {
              prop: prop,
              options: options
            }
          }))),
      finalize(() => {
        this.store.dispatch(new leadPropertyMetadataActions.LeadPropertyMetadataUpdate(this.properties));
      })
    );

    let optionsSubscription = optionsToObserve$.subscribe(x => {
      let prop = x["prop"];
      let options = x["options"];
      this.properties.find(x => x.id === prop).options = options;
    });

    this.subscriptions.push(optionsSubscription);
  }

  public get(): LeadPropertyMetadata[] {
    let copy: LeadPropertyMetadata[] = [];

    if (!this.properties || !this.properties.length) {
      this.initProperties();
    }

    this.properties.forEach(prop => copy.push(_.cloneDeep(prop)));
    return copy;
  }

  public getDealType(properties: LeadPropertyMetadata[]): DealType {
    let typeProperty = properties.find(prop => prop.id === "type");

    if (typeProperty) {
      let selectedOption = typeProperty.options.find(option => option.selected === true);

      if (selectedOption && (selectedOption.title === "להשכיר" || selectedOption.title === "לשכור")) {
        return DealType.Rent;
      }
    }

    return DealType.Sell;
  }

  public getOppositeLeadType(leadType: LeadTypeID): LeadTypeID {
    switch (leadType) {
      case LeadTypeID.Buyer:
        return LeadTypeID.Seller;
      case LeadTypeID.Seller:
        return LeadTypeID.Buyer;
      case LeadTypeID.Landlord:
        return LeadTypeID.Tenant;
      case LeadTypeID.Tenant:
        return LeadTypeID.Landlord;
    }
  }

  public getDealTypeByLeadType(leadTypeId: LeadTypeID): DealType {
    if (leadTypeId === LeadTypeID.Buyer || leadTypeId === LeadTypeID.Seller) {
      return DealType.Sell
    }

    return DealType.Rent;
  }

  public options(prop: LeadProperty): Observable<PropertyOption[]> {
    return this.store.select(state => state.User)
      .pipe(filter(x => !isNullOrUndefined(x?.Settings?.settings[prop])))
      .pipe(map(x => x.Settings.settings[prop]))
      .pipe(map(x => x.map(prop => new PropertyOption(prop.name))))
      .pipe(take(1));
  }

  public getBasicLeadProperties() {
    let properties = [
      {
        id: LeadProperty.type,
        title: 'סוג עסקה',
        description: 'מה {leadName} מעוניינ/ת לבצע?',
        icon: 'key',
        type: LeadPropertyType.StringSingleValue,
        filterable: false,
        mandatory: true
      },
      {
        id: LeadProperty.property,
        title: 'סוג הנכס',
        description: 'מה {leadName} מעוניינ/ת {dealType}?',
        icon: 'business',
        type: LeadPropertyType.StringSingleValue,
        filterable: true,
        editable: true,
        stringsKey: "PROPERTY_TYPES"
      },
      {
        id: LeadProperty.rooms,
        title: 'מספר חדרים',
        description: 'במידה והכנס מסחרי, תוכל להזין גודל נכס במטרים',
        icon: 'people',
        type: LeadPropertyType.StringSingleValue,
        filterable: true
      },
      {
        id: LeadProperty.meters,
        title: 'מטרים',
        description: 'שטח מסחרי מבוקש במטרים',
        icon: 'code',
        type: LeadPropertyType.StringSingleValue,
        filterable: true,
        hidden: true
      },
      {
        id: LeadProperty.budget,
        title: 'תקציב',
        description: 'מה המחיר בו {leadName} מעוניינ/ת {dealType}?',
        icon: 'cash',
        type: LeadPropertyType.Budget,
        filterable: false
      },
      {
        id: LeadProperty.area,
        title: 'אזור',
        description: '',
        icon: 'map',
        type: LeadPropertyType.StringMultivalue,
        filterable: true,
        editable: true,
        stringsKey: "AREAS"
      },
      {
        id: LeadProperty.source,
        title: 'מקור',
        description: 'היכן {leadName} שמע/ה עליך?',
        icon: 'link',
        type: LeadPropertyType.StringSingleValue,
        filterable: false,
        editable: true,
        stringsKey: "SOURCES"
      }
    ];

    return properties;
  }
}
