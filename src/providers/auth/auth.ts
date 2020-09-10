import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AuthenticationData } from '../../models/authentication';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import * as AuthActions from './store/auth.actions';
import { UserData } from '../user/models';

@Injectable()
export class AuthProvider {
  private translations: any;
  private user: firebase.User;
  public static emailNotVerifiedErrorCode = 'auth/email-not-verified';
  public static emailStorageKey = "email";

  constructor(
    public translateService: TranslateService,
    public storage: NativeStorage,
    public store: Store<AppState>) {
    this.translateService.use('he');
    this.translateService.get([
      'SIGNUP_ERROR', 'SIGNUP_ERROR_WEAK', 'SIGNUP_ERROR_EMAIL_USED', 'LOGIN_WRONG_CREDENTIALS',
      'LOGIN_ERROR', 'LOGIN_EMAIL_NOT_VERIFIED', 'PASSWORD_RECOVERY_FAIL', 'PASSWORD_RECOVERY_NO_ACCOUNT']).subscribe((values) => {
        this.translations = values;
      });

      this.subscribeToAuthChange();
  }

  public doRegister(data: AuthenticationData): Promise<firebase.User> {
    return firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
      .then(
        res => {
          this.storage.setItem(AuthProvider.emailStorageKey, data.email);

          this.store.dispatch(
            new AuthActions.RegisterSuccess(<UserData>{
              email: res.user.email,
              id: res.user.uid
            }));

          return Promise.resolve(res.user);
        },
        err => {
          console.log('User register failed.', err.code);
          return Promise.reject(<Error>{ name: err.code, message: this.getRegisterErrorString(err.code) });
        }
      )
  }

  public doLogin(data: AuthenticationData): Promise<firebase.User> {
    return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
      .then(
        res => {
          this.storage.setItem(AuthProvider.emailStorageKey, data.email);
          if (!res.user.emailVerified) {
            let code = AuthProvider.emailNotVerifiedErrorCode;
            console.log("User login failed due to email not being verified.", res.user)
            return Promise.reject(<Error>{ name: code, message: this.getLoginErrorString(code) });
          }

          this.store.dispatch(
            new AuthActions.LoginSuccess(<UserData>{
              email: res.user.email,
              id: res.user.uid
            }));

          return Promise.resolve(res.user);
        },
        err => {
          console.log('User login failed.', err.code);
          return Promise.reject(<Error>{ name: err.code, message: this.getLoginErrorString(err.code) });
        }
      )
  }

  public doLogout(): Promise<void> {
    if (!firebase.auth().currentUser) {
      return Promise.resolve();
    }

    this.store.dispatch(new AuthActions.LogoutSuccess());

    return firebase.auth().signOut().then(() => console.log("User signed out"));
  }

  public doSendVerificationEmail(): Promise<void> {
    if (!firebase.auth().currentUser) {
      return Promise.reject("Send verification failed. User not logged in.");
    }
    return firebase.auth().currentUser.sendEmailVerification().then(
      () => Promise.resolve(),
      (err) => {
        console.log('Send verification failed.', err.code);
        return Promise.reject(<Error>{ name: err.code, message: this.getEmailVerificationErrorString(err.code) });
      }
    );
  }

  public doSendPasswordResetEmail(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email).then(
      () => Promise.resolve(),
      (err) => {
        console.log('Send verification failed.', err.code);
        return Promise.reject(<Error>{ name: err.code, message: this.getPasswordResetErrorString(err.code) });
      }
    );;
  }

  private subscribeToAuthChange(): void {
    firebase.auth().onAuthStateChanged((res) => {
      let userData: UserData = res ? { id: res.uid, email: res.email } : null;
      this.store.dispatch(new AuthActions.LoginSuccess(userData))
    });
  }

  private getRegisterErrorString(errorCode: string) {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return this.translations.SIGNUP_ERROR_EMAIL_USED;
      case "auth/weak-password":
        return this.translations.SIGNUP_ERROR_WEAK;
      default:
        return this.translations.SIGNUP_ERROR;
    }
  }

  private getLoginErrorString(errorCode: string) {
    switch (errorCode) {
      case "auth/wrong-password":
      case "auth/user-not-found":
        return this.translations.LOGIN_WRONG_CREDENTIALS;
      case AuthProvider.emailNotVerifiedErrorCode:
        return this.translations.LOGIN_EMAIL_NOT_VERIFIED;
      default:
        return this.translations.LOGIN_ERROR;
    }
  }
  private getEmailVerificationErrorString(errorCode: string) {
    switch (errorCode) {
      default:
        return this.translations.AUTH_EMAIL_VERIFICATION_ERROR;
    }
  }

  private getPasswordResetErrorString(errorCode: string) {
    switch (errorCode) {
      case "auth/user-not-found":
        return this.translations.PASSWORD_RECOVERY_NO_ACCOUNT;
      default:
        return this.translations.PASSWORD_RECOVERY_FAIL;
    }
  }
}
