const _ = Cypress._
import './commands';

export const getGreeting = () => cy.get('h2');
export const getLogo = () => cy.get('.logo button');
export const getLanguages = () => cy.get('.languages');
export const getLoginLink = () => cy.get('.login-link');
export const getLoginButton = () => cy.get('.toolbar-login-button');
export const getHelp = () => cy.get('.help');
export const getFeed = () => cy.get('.feed');
export const getAppName = () => cy.get('.app-name a');

const responseToToken = (resp) => {
  const uri = url.parse(resp.redirectedToUrl, true)
  expect(uri.query).to.have.property('id_token')
  return uri.query.id_token
}

export const login = (username, password) => {
  cy.visit('/');
  cy.get('.login-link').click();

  cy.get('input[name="email"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('form').submit()



  console.log('3333333333333333333333333333333333333333333333-0')
  // cy.url().then(url => {
  //   console.log('3333333333333333333333333333333333333333333333-1')
  //   console.log(url)
  //   const optionsHash = {url};
  //   let options = url.substring(url.indexOf('&')+1)
  //   options = options.split('&').map(s => s.split('='))
  //   options.forEach(([k,v]) => {
  //     optionsHash[k] = v;
  //   })
  //   console.log('3333333333333333333333333333333333333333333333-2')
  //   cy.login(username, password, optionsHash)
  // })
  // console.log(cy.url({log: true}));
  // console.log(window.location.href)
  // console.log('11111111111111111111111111111111111-B')
  // cy.loginOkta(username, password)
  // .then(response => {
  //   console.log(response)
  // //   return responseToToken(response)
  // })
  // .then((id_token) => {
  //   console.log(id_token)
  // })
}
