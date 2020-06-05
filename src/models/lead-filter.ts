import { LeadPropertyType, LeadPropertyMetadata } from './lead-property-metadata';

export class LeadFilter{
    public metadata: LeadPropertyMetadata;
    public id: string;
    public selected: boolean;
    public type: LeadPropertyType;
    public value: any;

    constructor(id: string, filterType: LeadPropertyType, value: any){
        this.metadata = null;
        this.selected = false;
        this.id = id;
        this.type = filterType;
        this.value = value; 
    }
}