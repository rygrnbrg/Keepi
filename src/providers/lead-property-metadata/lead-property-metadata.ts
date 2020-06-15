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
        description: 'מה {leadName} מעוניין לבצע?',
        options: [
          new PropertyOption("לרכוש", false, LeadTypeID.Buyer),
          new PropertyOption("למכור", false, LeadTypeID.Seller),
          new PropertyOption("לשכור", false, LeadTypeID.Tenant),
          new PropertyOption("להשכיר", false, LeadTypeID.Landlord)
        ],
        icon: 'key',
        type: LeadPropertyType.StringSingleValue,
        filterable: false,
        mandatory: true
      },
      {
        id: LeadProperty.property,
        title: 'סוג הנכס',
        description: 'מה {leadName} מעוניין {dealType}?',
        options: this.getOptions(LeadProperty.property),
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
        options: this.getOptions(LeadProperty.rooms),
        icon: 'people',
        type: LeadPropertyType.StringSingleValue,
        filterable: true
      },
      {
        id: LeadProperty.meters,
        title: 'מטרים',
        description: 'שטח מסחרי מבוקש במטרים',
        options: this.getOptions(LeadProperty.meters),
        icon: 'code',
        type: LeadPropertyType.StringSingleValue,
        filterable: true,
        hidden: true
      },
      {
        id: LeadProperty.budget,
        title: 'תקציב',
        description: 'מה המחיר (בשקלים) בו {leadName} מוכנ/ה {dealType}?',
        icon: 'cash',
        type: LeadPropertyType.Budget,
        filterable: false
      },
      {
        id: LeadProperty.area,
        title: 'אזור',
        description: '',
        options: this.getOptions(LeadProperty.area),
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
        options: this.getOptions(LeadProperty.source),
        icon: 'link',
        type: LeadPropertyType.StringSingleValue,
        filterable: false,
        editable: true,
        stringsKey: "SOURCES"
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
}
