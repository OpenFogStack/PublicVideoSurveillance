function signup(user, context, callback) {
  const namespace = "https://watchyourfac.es/";
  user.app_metadata = user.app_metadata || {};
  // short-circuit if the user signed up already
  if (user.app_metadata.signed_up) {
    context.idToken[namespace + "first_login"] = false;
    return callback(null, user, context);
  }

  // first time login/signup
  user.app_metadata.signed_up = true;
  auth0.users
    .updateAppMetadata(user.user_id, user.app_metadata)
    .then(function() {
      context.idToken[namespace + "first_login"] = true;
      callback(null, user, context);
    })
    .catch(function(err) {
      callback(err);
    });
}
