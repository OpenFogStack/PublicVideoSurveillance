"use strict";

const jwt = require("jsonwebtoken");
const { getAuth0ClientPublicKey } = require("../../lib");
const credentials = require("../../auth0/credentials");

// these are environment variables, set in serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// Lambda expects a policy to be returned in case of valid authentication
// this is a helper function, reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html#api-gateway-lambda-authorizer-token-lambda-function-create
let generatePolicy = (principalId, effect, resource) => {
  let authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

/**
 * function to authorize api requests, expecting a JSON Web Token (JWT)
 * @param event
 * @param context
 * @param callback
 * @returns {*}
 */
module.exports.auth = (event, context, callback) => {
  if (!event.authorizationToken) {
    // no token was transferred
    return callback("Unauthorized");
  }

  let token = event.authorizationToken.split(" ");
  let tokenValue = token[1];
  if (token[0].toLowerCase() !== "bearer" || tokenValue === undefined) {
    // token type is invalid or no value was transferred, so no valid jwt was submitted
    return callback("Unauthorized");
  }
  let options = {
    audience: AUTH0_CLIENT_ID,
    algorithms: ["RS256"],
    issuer: `https://${credentials.auth0.userManagement.domain}/`
  };
  try {
    jwt.verify(
      tokenValue,
      AUTH0_CLIENT_PUBLIC_KEY,
      options,
      (verifyError, decoded) => {
        if (verifyError) {
          // this JWT was tampered, 401 Unauthorized
          console.log("verifyError", verifyError);
          return callback("Unauthorized");
        }
        // valid jwt
        // decoded.sub is the users' id
        return callback(
          null,
          generatePolicy(decoded.sub, "Allow", event.methodArn)
        );
      }
    );
  } catch (err) {
    console.log("Catch error", err);
    return callback("Unauthorized");
  }
};
