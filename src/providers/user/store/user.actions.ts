import { Action } from '@ngrx/store';
import { UserData } from 'src/providers/user/user';

export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';


export class UpdateUserData implements Action{
    readonly type = UPDATE_USER_DATA;
    payload: UserData
}

export type UserActions = UpdateUserData
