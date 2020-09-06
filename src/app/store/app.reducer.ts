import * as fromUser from 'src/providers/user/store/user.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    User: fromUser.UserState;
}

export const appReducer: ActionReducerMap<AppState> = {  
    User: fromUser.userReducer
}
