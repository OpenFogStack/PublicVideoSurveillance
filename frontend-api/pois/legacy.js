"use strict";
const vandium = require("vandium");
const {
  createUserActionLogEntry
} = require("../../secure-log-api/log-manager");

const { LOG_ACTIONS, RESOURCE_TYPES } = require("../../constants");

const {
  successResponse,
  errorResponse,
  getUserIdOfJWT,
  getAuth0ClientPublicKey
} = require("../../lib");
const Poi = require("./index");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /pois
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
  .POST(
    {
      body: {
        id: vandium.types
          .string()
          .min(5)
          .max(12)
          .required(),
        firstName: vandium.types
          .string()
          .min(2)
          .required(),
        lastName: vandium.types
          .string()
          .min(2)
          .required(),
        reason: vandium.types
          .string()
          .allow("")
          .optional(),
        description: vandium.types
          .string()
          .allow("")
          .optional()
      }
    },
    (event, context) => {
      console.log("Created POI, JWT= ");
      console.dir(event.jwt);
      const userId = getUserIdOfJWT(event.jwt);

      return Poi.create(
        userId,
        event.body.id,
        event.body.firstName,
        event.body.lastName,
        event.body.reason,
        event.body.description
      )
        .then(poi => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.POI_CREATE,
            ResourceId: poi.id,
            ResourceType: RESOURCE_TYPES.POI,
            AdditionalInfoObject: {
              poi
            }
          });
          return successResponse({
            poi
          });
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /pois/{poiId}
exports.item = vandium
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
  .DELETE(event => {
    const userId = getUserIdOfJWT(event.jwt);

    return Poi.deleteById(event.pathParameters.id)
      .then(() => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_DELETE,
          ResourceId: event.pathParameters.id,
          ResourceType: RESOURCE_TYPES.POI,
          AdditionalInfoObject: {
            poiId: event.pathParameters.id
          }
        });
        return successResponse({});
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .PUT(
    {
      body: {
        imageId: vandium.types
          .string()
          .min(1)
          .required(),
        isFootage: vandium.types.boolean()
      }
    },
    event => {
      const userId = getUserIdOfJWT(event.jwt);

      return Poi.addImage(
        event.pathParameters.id,
        event.body.imageId,
        event.body.isFootage
      )
        .then(s3Key => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.POI_IMAGE_ADD,
            ResourceId: event.pathParameters.id,
            ResourceType: RESOURCE_TYPES.POI,
            AdditionalInfoObject: {
              poiId: event.pathParameters.id,
              imageId: event.body.imageId
            }
          });
          return successResponse({
            imageId: event.body.imageId
          });
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /pois/{poiId}/images
exports.images = vandium
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
  .DELETE(event => {
    const userId = getUserIdOfJWT(event.jwt);

    return Poi.deleteImage(
      event.pathParameters.id,
      event.pathParameters.imageId
    )
      .then(() => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_IMAGE_DELETE,
          ResourceId: event.pathParameters.id,
          ResourceType: RESOURCE_TYPES.POI,
          AdditionalInfoObject: {
            poiId: event.pathParameters.id,
            imageId: event.pathParameters.imageId
          }
        });
        return successResponse({});
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });

exports.footages = vandium
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
    return Poi.getAllFootages(event.pathParameters.id)
      .then(footages =>
        successResponse({
          footages
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(event => {
    const userId = getUserIdOfJWT(event.jwt);

    return Poi.deleteFootage(
      event.pathParameters.id,
      event.pathParameters.imageId
    )
      .then(() => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_FOOTAGE_DELETE,
          ResourceId: event.pathParameters.id,
          ResourceType: RESOURCE_TYPES.POI,
          AdditionalInfoObject: {
            poiId: event.pathParameters.id,
            imageId: event.pathParameters.imageId
          }
        });
        return successResponse({});
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });
