// this is code that is executed inside Auth0
// used to include geo ip information the id_token
// rule can be edited here: https://manage.auth0.com/#/rules/rul_21f1Ejz7BA38L1wH
// documentation: https://auth0.com/docs/rules/current/context
// namespace is required!
function geoIP(user, context, callback) {
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.geoip = context.request.geoip;
  user.user_metadata.geoip.ip = context.request.ip;

  auth0.users
    .updateUserMetadata(user.user_id, user.user_metadata)
    .then(function() {
      let namespace = "https://watchyourfac.es/";
      context.request.geoip.ip = context.request.ip;
      context.idToken[namespace + "geoIP"] = context.request.geoip;
      callback(null, user, context);
    })
    .catch(function(err) {
      callback(err);
    });
}
