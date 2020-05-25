import { LeadPropertyType, LeadPropertyMetadata } from './lead-property-metadata';

export class LeadFilter{
    public metadata: LeadPropertyMetadata;
    public id: string;
    public selected: boolean;
    public type: LeadPropertyType;
    public value: any;
}