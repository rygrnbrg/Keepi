import { Action } from '@ngrx/store';
import { LeadPropertyMetadata } from 'src/models/lead-property-metadata';

export const LEAD_PROPERTY_METADATA_UPDATE = 'LEAD_PROPERTY_METADATA_UPDATE';

export class LeadPropertyMetadataUpdate implements Action {
    readonly type = LEAD_PROPERTY_METADATA_UPDATE;

    constructor(public payload: LeadPropertyMetadata[]) {

    }
}

export type LeadPropertyMetadataActions = LeadPropertyMetadataUpdate;
