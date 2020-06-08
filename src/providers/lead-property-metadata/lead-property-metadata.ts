import { DealType, LeadTypeID, LeadType } from './../../models/lead-property-metadata';
import { LeadPropertyType } from '../../models/lead-property-metadata';
import { Injectable } from '@angular/core';
import { PropertyOption, LeadPropertyMetadata } from '../../models/lead-property-metadata'
import * as _ from "lodash";
import { User } from '../../providers';
import { LeadProperty } from 'src/models/LeadProperty';

@Injectable()
export class LeadPropertyMetadataProvider {
  private properties: LeadPropertyMetadata[] = [];
  public static relevanceKey = "relevant";
  public static commentKey = "comment";

  constructor(
    private user: User) {
    this.properties = [
      {
        id: LeadProperty.type,
        title: 'סוג עסקה',
        description: 'מעוניין ב',
        options: [
          new PropertyOption("להשכיר", false, LeadTypeID.Landlord),
          new PropertyOption("לרכוש", false, LeadTypeID.Buyer),
          new PropertyOption("לשכור", false, LeadTypeID.Tenant),
          new PropertyOption("למכור", false, LeadTypeID.Seller)
        ],
        icon: 'key',
        type: LeadPropertyType.StringSingleValue,
        filterable: false,
        mandatory: true
      },
      {
        id: LeadProperty.property,
        title: 'סוג הנכס',
        description: 'סוג הנכס',
        options: [
          new PropertyOption("דירה"),
          new PropertyOption("קוטג' / בית פרטי"),
          new PropertyOption("פנטהאוז / מיני פנט'"),
          new PropertyOption("דירת גן"),
          new PropertyOption("דופלקס"),
          new PropertyOption("משק / נחלה"),
          new PropertyOption("מרתף"),
          new PropertyOption("מחולקת"),
          new PropertyOption("מחסן"),
          new PropertyOption("משרד"),
          new PropertyOption("חנות"),
          new PropertyOption("אולם"),
          new PropertyOption("תעשייה"),
          new PropertyOption("מגרש")
        ],
        icon: 'business',
        type: LeadPropertyType.StringSingleValue,
        filterable: true
      },
      {
        id: LeadProperty.rooms,
        title: 'חדרים',
        description: 'מספר חדרים מבוקש',
        options: [
          new PropertyOption("1"),
          new PropertyOption("2"),
          new PropertyOption("3"),
          new PropertyOption("4"),
          new PropertyOption("5"),
          new PropertyOption("6"),
          new PropertyOption("יותר מ-6"),
          new PropertyOption("מסחרי")
        ],
        icon: 'people',
        type: LeadPropertyType.StringSingleValue,
        filterable: true
      },
      {
        id: LeadProperty.meters,
        title: 'מטרים',
        description: 'שטח מבוקש במטרים',
        options: [
          new PropertyOption("עד 50"),
          new PropertyOption("50 - 100"),
          new PropertyOption("100 - 200"),
          new PropertyOption("200 - 500"),
          new PropertyOption("500 - 1,000"),
          new PropertyOption("יותר מ-500")
        ],
        icon: 'code',
        type: LeadPropertyType.StringSingleValue,
        filterable: true,
        hidden: true
      },
      {
        id: LeadProperty.budget,
        title: 'תקציב',
        description: 'תקציב בשקלים',
        icon: 'cash',
        type: LeadPropertyType.Budget,
        filterable: false
      },
      {
        id: LeadProperty.area,
        title: 'אזור',
        description: 'האזור המבוקש',
        options: this.getOptions(LeadProperty.area),
        icon: 'map',
        type: LeadPropertyType.StringMultivalue,
        filterable: true
      },
      {
        id: LeadProperty.source,
        title: 'מקור',
        description: 'מאיפה הליד הגיע אלינו?',
        options: [
          new PropertyOption('יד 2'),
          new PropertyOption('אתר הבית'),
          new PropertyOption('פייסבוק'),
          new PropertyOption('שלט'),
          new PropertyOption('עיתון מקומי'),
          new PropertyOption('המלצה / אחר')
        ],
        icon: 'link',
        type: LeadPropertyType.StringSingleValue,
        filterable: false
      }
    ];
  }

  public get(): LeadPropertyMetadata[] {
    let copy: LeadPropertyMetadata[] = [];
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

  public getOptions(prop: LeadProperty): PropertyOption[] {
    return this.user.getUserData().settings[prop].map(x => new PropertyOption(x.name));
  }

  private getPropertyOptions(prop: LeadProperty) {

  }
}
