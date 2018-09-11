"use strict";
const vandium = require("vandium");
const {
  createUserActionLogEntry
} = require("../../secure-log-api/log-manager");
const { createApprovalAction } = require("../../approval-api");
const { doesApprovalItemExist } = require("../../approval-api/data/get");

const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../../constants");

const {
  successResponse,
  errorResponse,
  getUserIdOfJWT,
  getAuth0ClientPublicKey,
  userHasAccess
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
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:pois")) {
      return errorResponse("Forbidden", 403);
    }
    return Poi.getAll(event.jwt)
      .then(pois =>
        successResponse({
          pois
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .POST(
    {
      body: {
        id: vandium.types
          .string()
          .min(5)
          .max(12)
          .regex(/^[^\$%\^\.\ -,*£=~@€!"$&\/\\|\(\)\{\}\[\]\?:;#'+]+$/)
          .required(),
        firstName: vandium.types
          .string()
          .min(2)
          .regex(/^[^\$%\^*£=~@€,!"$&\/\\|\(\)\{\}\[\]\?:;#'+\d]+$/)
          .required(),
        lastName: vandium.types
          .string()
          .min(2)
          .regex(/^[^\$%\^*£=~@€,!"$&\/\\|\(\)\{\}\[\]\?:;#'+\d]+$/)
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
    event => {
      if (!userHasAccess(event.jwt, "create:pois")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);

      return createApprovalAction({
        action: APPROVAL_ACTIONS.POI_NEW,
        resourceType: RESOURCE_TYPES.POI,
        parameters: {
          id: event.body.id,
          firstName: event.body.firstName,
          lastName: event.body.lastName,
          reason: event.body.reason,
          description: event.body.description
        },
        userId: userId
      })
        .then(_ => {
          console.log(" " + userId + " " + JSON.stringify(event));
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.POI_CREATE_APPROVAL_ACTION,
            ResourceId: event.body.id,
            ResourceType: RESOURCE_TYPES.POI,
            AdditionalInfoObject: {
              id: event.body.id,
              firstName: event.body.firstName,
              lastName: event.body.lastName,
              reason: event.body.reason,
              description: event.body.description
            }
          });
          return successResponse({});
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
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:pois")) {
      return errorResponse("Forbidden", 403);
    }
    return Poi.getById(event.pathParameters.id, event.jwt)
      .then(poi =>
        successResponse({
          poi
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:pois")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.POI_DELETE;
    const resourceType = RESOURCE_TYPES.POI;
    const resourceId = event.pathParameters.id;
    const itemAlreadyExists = await doesApprovalItemExist(
      action,
      resourceType,
      resourceId,
      userId
    );
    if (itemAlreadyExists) {
      return errorResponse("Approval Item already exists", 409);
    }

    return createApprovalAction({
      action: action,
      resourceType: resourceType,
      resourceId: resourceId,
      userId: userId
    })
      .then(_ => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_DELETE_APPROVAL_ACTION,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            poiId: resourceId
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
      if (!userHasAccess(event.jwt, "update:pois")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);
      // do not check for doesApprovalItemExist here
      // this is the upload of images to a poi which we allow multiple times

      return createApprovalAction({
        action: APPROVAL_ACTIONS.POI_IMAGE_ADD,
        resourceType: RESOURCE_TYPES.POI,
        resourceId: event.pathParameters.id,
        parameters: {
          imageId: event.body.imageId,
          isFootage: event.body.isFootage
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.POI_IMAGE_ADD_APPROVAL_ACTION,
            ResourceId: event.pathParameters.id,
            ResourceType: RESOURCE_TYPES.POI,
            AdditionalInfoObject: {
              imageId: event.body.imageId,
              isFootage: event.body.isFootage
            }
          });
          return successResponse({}, 200);
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
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:pois")) {
      return errorResponse("Forbidden", 403);
    }
    return Poi.getAllImages(event.pathParameters.id, event.jwt)
      .then(images =>
        successResponse({
          images
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:pois")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.POI_IMAGE_DELETE;
    const resourceType = RESOURCE_TYPES.POI;
    const resourceId = event.pathParameters.id;
    const itemAlreadyExists = await doesApprovalItemExist(
      action,
      resourceType,
      resourceId,
      userId
    );
    if (itemAlreadyExists) {
      return errorResponse("Approval Item already exists", 409);
    }

    return createApprovalAction({
      action: action,
      resourceType: resourceType,
      resourceId: resourceId,
      parameters: {
        imageId: event.pathParameters.imageId
      },
      userId: userId
    })
      .then(_ => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_IMAGE_DELETE_APPROVAL_ACTION,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            imageId: event.pathParameters.imageId
          }
        });
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });

// /pois/{poiId}/users
exports.users = vandium
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
    if (!userHasAccess(event.jwt, "read:pois")) {
      return errorResponse("Forbidden", 403);
    }
    return Poi.getAllUsers(event.pathParameters.id, event.jwt)
      .then(users =>
        successResponse({
          users
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(
    {
      pathParameters: {
        userId: vandium.types
          .string()
          .min(5)
          .max(250)
          .required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "delete:pois")) {
        return errorResponse("Forbidden", 403);
      }
      const requestUserId = getUserIdOfJWT(event.jwt);

      const userId = decodeURIComponent(event.pathParameters.userId);
      const action = APPROVAL_ACTIONS.POI_USER_DELETE;
      const resourceType = RESOURCE_TYPES.POI;
      const resourceId = event.pathParameters.id;
      const itemAlreadyExists = await doesApprovalItemExist(
        action,
        resourceType,
        resourceId,
        requestUserId
      );
      if (itemAlreadyExists) {
        return errorResponse("Approval Item already exists", 409);
      }

      return createApprovalAction({
        action: action,
        resourceType: resourceType,
        resourceId: resourceId,
        parameters: {
          userId: userId
        },
        userId: requestUserId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: requestUserId,
            Action: LOG_ACTIONS.POI_USER_DELETE_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              userId: userId
            }
          });
          return successResponse({}, 200);
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  )
  .PUT(
    {
      body: {
        userId: vandium.types
          .string()
          .min(5)
          .required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "update:pois")) {
        return errorResponse("Forbidden", 403);
      }
      const requestUserId = getUserIdOfJWT(event.jwt);
      const action = APPROVAL_ACTIONS.POI_USER_ADD;
      const resourceType = RESOURCE_TYPES.POI;
      const resourceId = event.pathParameters.id;
      const itemAlreadyExists = await doesApprovalItemExist(
        action,
        resourceType,
        resourceId,
        requestUserId
      );
      if (itemAlreadyExists) {
        return errorResponse("Approval Item already exists", 409);
      }

      return createApprovalAction({
        action: action,
        resourceType: resourceType,
        resourceId: resourceId,
        parameters: {
          userId: event.body.userId
        },
        userId: requestUserId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: requestUserId,
            Action: LOG_ACTIONS.POI_USER_ADD_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              userId: event.body.userId
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

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
    if (!userHasAccess(event.jwt, "read:pois")) {
      return errorResponse("Forbidden", 403);
    }
    return Poi.getAllFootages(event.pathParameters.id, event.jwt)
      .then(footages =>
        successResponse({
          footages
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:pois")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.POI_FOOTAGE_DELETE;
    const resourceType = RESOURCE_TYPES.POI;
    const resourceId = event.pathParameters.id;
    const itemAlreadyExists = await doesApprovalItemExist(
      action,
      resourceType,
      resourceId,
      userId
    );
    if (itemAlreadyExists) {
      return errorResponse("Approval Item already exists", 409);
    }

    return createApprovalAction({
      action: action,
      resourceType: resourceType,
      resourceId: resourceId,
      parameters: {
        imageId: event.pathParameters.imageId
      },
      userId: userId
    })
      .then(_ => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.POI_FOOTAGE_DELETE_APPROVAL_ACTION,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            imageId: event.pathParameters.imageId
          }
        });
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });
