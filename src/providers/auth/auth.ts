import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AuthenticationData } from '../../models/authentication';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable()
export class AuthProvider {
  private translations: any;
  public static emailNotVerifiedErrorCode = 'auth/email-not-verified';
  public static emailStorageKey = "email";

  constructor( 
    public translateService: TranslateService, 
    public storage: NativeStorage) {
    this.translateService.use('he');
    this.translateService.get([
      'SIGNUP_ERROR', 'SIGNUP_ERROR_WEAK', 'SIGNUP_ERROR_EMAIL_USED', 'LOGIN_WRONG_CREDENTIALS',
      'LOGIN_ERROR', 'LOGIN_EMAIL_NOT_VERIFIED', 'PASSWORD_RECOVERY_FAIL', 'PASSWORD_RECOVERY_NO_ACCOUNT']).subscribe((values) => {
        this.translations = values;
      })
  }

  doRegister(data: AuthenticationData): Promise<firebase.User> {
    return firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
      .then(
        res => {
          this.storage.setItem(AuthProvider.emailStorageKey, data.email);
          return Promise.resolve(res.user);
        },
        err => {
          console.log('User register failed.', err.code);
          return Promise.reject(<Error>{ name: err.code, message: this.getRegisterErrorString(err.code) });
        }
      )
  }

  doLogin(data: AuthenticationData): Promise<firebase.User> {
    return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
      .then(
        res => {
          this.storage.setItem(AuthProvider.emailStorageKey, data.email);
          if (!res.user.emailVerified) {
            let code = AuthProvider.emailNotVerifiedErrorCode;
            console.log("User login failed due to email not being verified.", res.user)
            return Promise.reject(<Error>{ name: code, message: this.getLoginErrorString(code) });
          }
          return Promise.resolve(res.user);
        },
        err => {
          console.log('User login failed.', err.code);
          return Promise.reject(<Error>{ name: err.code, message: this.getLoginErrorString(err.code) });
        }
      )
  }

  doLogout(): Promise<void> {
    if (!firebase.auth().currentUser) {
      return Promise.resolve();
    }
    return firebase.auth().signOut();
  }

  doSendVerificationEmail(): Promise<void> {
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

  doSendPasswordResetEmail(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email).then(
      () => Promise.resolve(),
      (err) => {
        console.log('Send verification failed.', err.code);
        return Promise.reject(<Error>{ name: err.code, message: this.getPasswordResetErrorString(err.code) });
      }
    );;
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
