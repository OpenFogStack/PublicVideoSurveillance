// this is code that is executed inside Auth0
// used to include roles and permissions to the id_token
// rule can be edited here: https://manage.auth0.com/#/rules/rul_p3e9YSfM16kKP6h8
// documentation: https://auth0.com/docs/rules/current/context
// namespace is required!
function authRule(user, context, callback) {
  let namespace = "https://watchyourfac.es/";
  context.idToken[namespace + "userAuthorization"] = {
    roles: user.roles,
    permissions: user.permissions
  };
  return callback(null, user, context);
}
