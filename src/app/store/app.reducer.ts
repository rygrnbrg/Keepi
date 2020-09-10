import * as fromUser from 'src/providers/user/store/user.reducer';
import { ActionReducerMap } from '@ngrx/store';
import * as fromLeadPropertyMetadata from 'src/providers/lead-property-metadata/store/lead-property-metadata.reducer';
import * as fromAuth from 'src/providers/auth/store/auth.reducer';

export interface AppState {
    User: fromUser.UserState;
    LeadPropertyMetadata: fromLeadPropertyMetadata.LeadPropertyMetadataState;
    Auth: fromAuth.AuthState
}

export const appReducer: ActionReducerMap<AppState> = {  
    User: fromUser.userReducer,
    LeadPropertyMetadata: fromLeadPropertyMetadata.leadPropertyMetadataReducer,
    Auth: fromAuth.authReducer
}
