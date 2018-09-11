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
  getAuth0ClientPublicKey,
  userHasAccess
} = require("../../lib");
const Image = require("./index");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /images
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
  .POST(
    {
      body: {
        poiId: vandium.types
          .string()
          .min(5)
          .max(12)
          .required(),
        image: vandium.types
          .string()
          .min(1)
          .required(),
        isFootage: vandium.types.boolean()
      }
    },
    event => {
      if (!userHasAccess(event.jwt, "create:pois")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);

      return Image.create(
        event.body.poiId,
        event.body.image,
        event.body.isFootage
      )
        .then(image => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.IMAGE_CREATE,
            ResourceId: image.imageId,
            ResourceType: RESOURCE_TYPES.IMAGE,
            AdditionalInfoObject: {
              image
            }
          });
          return successResponse({
            image
          });
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );
