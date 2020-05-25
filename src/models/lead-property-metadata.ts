export enum LeadPropertyType {
  Budget,
  StringMultivalue,
  StringSingleValue,
  FreeText,
  Boolean
}

export class LeadPropertyMetadata {
  public id: string;
  public title: string;
  public description: string;
  public image?: string;
  public options?: PropertyOption[];
  public value?: any[] | any;
  public icon?: string;
  public type: LeadPropertyType;
  public filterable: boolean;
  public hidden?: boolean;

  static getValueString(
    leadPropertyMetadata: LeadPropertyMetadata,
    value?: any
  ): string {
    switch (leadPropertyMetadata.type) {
      case LeadPropertyType.Budget:
        if (value) {
          return value;
        }
        return leadPropertyMetadata.value;
      case LeadPropertyType.StringSingleValue:
        if (value) {
          return value;
        }

        return LeadPropertyMetadata.optionsToString(leadPropertyMetadata.options);

      case LeadPropertyType.StringMultivalue:
        if (value){
          return (<string[]>value).join(', ');
        }
        return this.optionsToString(leadPropertyMetadata.options);

      default:
        return "";
    }
  }

  private static optionsToString(options: PropertyOption[]) {
    return options
      .filter(option => option.selected === true)
      .map(option => option.title)
      .join(", ");
  }

  static reset(slide: LeadPropertyMetadata): void {
    slide.value = null;
    if (slide.options) {
      slide.options.forEach(option => (option.selected = false));
    }
  }
}

export class PropertyOption {
  title: string;
  selected: boolean;
  id?: any;

  constructor(title: string, selected?: boolean, id?: any) {
    this.title = title;
    this.selected = selected;
    this.id = id;
  }
}

export enum DealType{
  Sell, Rent
}

export enum LeadTypeID{
  Buyer = "Buyer",
  Seller = "Seller", 
  Tenant = "Tenant", 
  Landlord = "Landlord"
}

export class LeadType{
  id: LeadTypeID;
  translation: string;
  actionTranslation: string;

  constructor(id: LeadTypeID){
    this.id = id;
    this.translation = id.toString().toUpperCase();
    this.actionTranslation = id.toString().toUpperCase() + "_ACTION";
  }

  public static getAllLeadTypes(): LeadType[]{
    return [
      new LeadType(LeadTypeID.Buyer),
      new LeadType(LeadTypeID.Seller),
      new LeadType(LeadTypeID.Tenant),
      new LeadType(LeadTypeID.Landlord)
    ]
  }
}