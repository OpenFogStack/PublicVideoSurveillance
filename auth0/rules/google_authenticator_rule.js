// this is code that is executed inside Auth0
// used to include google authenticator into the login process
// rule can be edited here: https://manage.auth0.com/#/rules/rul_MykjAe01Il5h43Zp
// documentation: https://auth0.com/docs/rules/current/context
function googleAuthentication(user, context, callback) {
  // Uncomment the following to skip MFA when impersonating a user
  // if (user.impersonated) { return callback(null, user, context); }

  let CLIENTS_WITH_MFA = ["mewWruC9mQEj9salyw1c2Te5qa31cXYs"];
  // run only for the specified clients
  if (CLIENTS_WITH_MFA.indexOf(context.clientID) !== -1) {
    // uncomment the following if clause in case you want to request a second factor only from users that have app_metadata.use_mfa === true
    // if (user.app_metadata && user.app_metadata.use_mfa){
    context.multifactor = {
      provider: "google-authenticator",

      // optional
      // issuer: 'Label on Google Authenticator App',

      // optional, defaults to true. Set to false to force Google Authenticator every time.
      // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
      allowRememberBrowser: false
    };
    // }
  }

  callback(null, user, context);
}
