"use strict";
const vandium = require("vandium");
const Log = require("./logs");

const {
  successResponse,
  errorResponse,
  getAuth0ClientPublicKey
} = require("../lib");

const { RESOURCE_TYPES } = require("../constants");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /logs
exports.collection = vandium
  .api()
  .cors({
    allowOrigin: "*",
    allowCredentials: true
  })
  .jwt({
    algorithm: "RS256",
    publicKey: AUTH0_CLIENT_PUBLIC_KEY, // if algorithm is 'RS256'
    token: "headers.Authorization"
  })
  .GET(event => {
    return Log.getAll()
      .then(log =>
        successResponse({
          log
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  });

// /logs/{resourceType}
exports.resourcetype = vandium
  .api()
  .cors({
    allowOrigin: "*",
    allowCredentials: true
  })
  .jwt({
    algorithm: "RS256",
    publicKey: AUTH0_CLIENT_PUBLIC_KEY, // if algorithm is 'RS256'
    token: "headers.Authorization"
  })
  .GET(
    {
      pathParameters: {
        type: vandium.types
          .string()
          .only(Object.values(RESOURCE_TYPES))
          .required()
      }
    },
    event => {
      return Log.getByResourceType(event.pathParameters.type)
        .then(logs =>
          successResponse({
            logs
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /logs/{resourceType}/{resourceId}
exports.resourceitem = vandium
  .api()
  .cors({
    allowOrigin: "*",
    allowCredentials: true
  })
  .jwt({
    algorithm: "RS256",
    publicKey: AUTH0_CLIENT_PUBLIC_KEY, // if algorithm is 'RS256'
    token: "headers.Authorization"
  })
  .GET(
    {
      pathParameters: {
        type: vandium.types
          .string()
          .only(Object.values(RESOURCE_TYPES))
          .required(),
        id: vandium.types
          .string()
          .min(2)
          .required()
      }
    },
    event => {
      return Log.getByResource(
        event.pathParameters.type,
        event.pathParameters.id
      )
        .then(logs =>
          successResponse({
            logs
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );
