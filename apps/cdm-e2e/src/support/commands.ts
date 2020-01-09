const _ = Cypress._;
const auth0 = require('auth0-js');

Cypress.Commands.add('login', (email, password, overrides = {}) => {
  Cypress.log({name: 'login'});

  const webAuth = new auth0.WebAuth({
    // domain: 'http://localhost:4200',
    domain: 'http://api.hid.vm',
    clientID: 'cdm-local',
    responseType: 'token'
  });

  webAuth.client.login({
    realm: 'Username-Password-Authentication',
    username: email,
    password: password,
    scope: 'profile'
  },
  function(err, authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      console.log(authResult)
      const token = {
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        // Set the time that the access token will expire at
        expiresAt: authResult.expiresIn * 1000 + new Date().getTime()
      };
      window.sessionStorage.setItem('my-super-duper-app:storage_token', JSON.stringify(token));
    } else {
      console.error('Problem logging into Auth0', err);
      throw err;
    }
  });
});


//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// for (var i = 0; i < localStorage.length; i++){
//     // do something with localStorage.getItem(localStorage.key(i));
// }

// import { OAuthService } from 'angular-oauth2-oidc';
// import { authConfig } from '../../../libs/core/src/lib/auth/auth.config';
//
// this.oauth.configure(authConfig);
// this.oauth.tokenValidationHandler = new JwksValidationHandler();
// this.oauth.setStorage(localStorage);
// this.oauth.tryLogin({});
//
// this.oauth.events
//   .pipe(filter(e => e.type === 'session_terminated'))
//   .subscribe(e => {
//     console.log(e, 'Your session has been terminated!');
//   });
//
// this.oauth.events.pipe(filter(e => e.type === 'token_received'))
//   .subscribe(e => {
//     console.log(e, 'Load profile');
//     this.oauth.loadUserProfile();
//   });













Cypress.Commands.add('loginOkta', (username, password, options) => {
  console.log(options)

  const optionsSessionToken = {
    method: 'POST',
    // url: 'http://api.hid.vm/?redirect=/oauth/authorize',//Cypress.env('session_token_url'),
    // url: 'http://api.hid.vm',//Cypress.env('session_token_url'),
    url: '/',//options.url,
    // url: 'http://api.hid.vm',
    qs:{
      redirectTo: 'http://localhost:4200'
    },
    // failOnStatusCode: false,
    form: true,
    body: {
      username: username,
      password: password,
      // options: options
      options: {
        warnBeforePasswordExpired: 'true'
      }
    }
  }
  console.log('====================================000')
  console.log(optionsSessionToken)
  cy.request(optionsSessionToken).then(response => {
    console.log('====================================001')
    console.log(response)
    const sessionToken = response.body.sessionToken;
    const qs = {
      client_id: options.client_id,//'cdm-local',//Cypress.env('client_id'),
      // code_challenge: Cypress.env('code_challenge'),
      state: options.state,//'mu25RtxOtvDDFthZEVpRtGW9urzNXHlUoMuUFM7h',//Cypress.env('state'),
      nonce: '',//Cypress.env('nonce'),
      redirect_uri: options.redirect_uri,//'http://localhost:4200',
      // code_challenge_method: 'S256',
      // response_mode: 'token', //'fragment',
      response_type: options.response_type,//'token',//'code',
      // scope: ['openid', 'profile', 'email'],
      scope: [options.scope],
      sessionToken: sessionToken
    }
    console.log(qs)
    cy.request({
      method: 'GET',
      url: Cypress.env('auth_token_url'),
      form: true,
      followRedirect: false,
      qs: qs
    }).then(responseWithToken => {
      const redirectUrl = responseWithToken.redirectedToUrl;

      const accessToken = redirectUrl
      .substring(redirectUrl.indexOf('access_token'))
      .split('=')[1]
      .split('&')[0];

      cy.wrap(accessToken).as('accessToken');

      cy.visit(redirectUrl).then(() => {
        cy.visit('/');
      });
    });
  });
})
