import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

export const authConfig: AuthConfig = {
    loginUrl : environment.authBaseUrl + '?redirect=/oauth/authorize',
    redirectUri : window.location.origin + '/',
    clientId : environment.authClientId,
    scope : 'profile',
    requireHttps : false,
    responseType: 'token',
    oidc: false,
    clearHashAfterLogin : false,
    postLogoutRedirectUri : window.location.origin + '/',
    userinfoEndpoint : environment.authBaseUrl + 'account.json',
    logoutUrl : environment.authBaseUrl + 'logout?redirect=' + window.location.origin + '/'
    // showDebugInformation: true
    // silentRefreshRedirectUri: window.location.origin + '/',
    // sessionChecksEnabled: true
}
