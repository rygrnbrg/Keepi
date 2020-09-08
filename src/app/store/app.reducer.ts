import * as fromUser from 'src/providers/user/store/user.reducer';
import { ActionReducerMap } from '@ngrx/store';
import * as fromLeadPropertyMetadata from 'src/providers/lead-property-metadata/store/lead-property-metadata.reducer';

export interface AppState {
    User: fromUser.UserState;
    LeadPropertyMetadata: fromLeadPropertyMetadata.LeadPropertyMetadataState;
}

export const appReducer: ActionReducerMap<AppState> = {  
    User: fromUser.userReducer,
    LeadPropertyMetadata: fromLeadPropertyMetadata.leadPropertyMetadataReducer
}
