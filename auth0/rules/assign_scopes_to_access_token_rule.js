// this is code that is executed inside Auth0
// used to assign the scopes for the user management api to the access_token
// this is only done if the user is an administrator or supervisor
// rule can be edited here: https://manage.auth0.com/#/rules/rul_Qd44iKkesi1A80zS
// documentation: https://auth0.com/docs/rules/current/context
function assignScopesToAccessToken(user, context, callback) {
  if (user.roles.indexOf("Administrator") !== -1) {
    let req = context.request;
    let scopes = (req.query && req.query.scope) || (req.body && req.body.scope);
    let permissionedScopes = [
      "read:users",
      "update:users",
      "delete:users",
      "create:users"
    ];
    scopes = (scopes && scopes.split(" ")) || [];
    context.accessToken.scope = scopes.concat(permissionedScopes).join(" ");
  }
  callback(null, user, context);
}
