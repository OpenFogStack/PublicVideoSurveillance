"use strict";
const vandium = require("vandium");
const { createUserActionLogEntry } = require("../secure-log-api/log-manager");
const { createApprovalAction } = require("../approval-api");
const { doesApprovalItemExist } = require("../approval-api/data/get");

const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../constants");

const {
  successResponse,
  errorResponse,
  getUserIdOfJWT,
  getAuth0ClientPublicKey,
  userHasAccess
} = require("../lib");
const Edge = require("./index");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /edge
exports.edges = vandium
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
    if (!userHasAccess(event.jwt, "read:edges")) {
      return errorResponse("Forbidden", 403);
    }
    if (event.pathParameters.id === undefined) {
      const userId = getUserIdOfJWT(event.jwt);
      return Edge.getAll(userId)
        .then(edges =>
          successResponse({
            edges
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    } else {
      const userId = getUserIdOfJWT(event.jwt);
      return Edge.getById(userId, event.pathParameters.id)
        .then(edge =>
          successResponse({
            edge
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  })
  .PUT(event => {
    if (!userHasAccess(event.jwt, "read:edges")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);

    return Edge.deleteCertificates(userId, event.pathParameters.id)
      .then(_ => {
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:edges")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.EDGE_DELETE;
    const resourceType = RESOURCE_TYPES.EDGE;
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
        id: resourceId
      },
      userId: userId
    })
      .then(_ => {
        createUserActionLogEntry({
          UserId: userId,
          Action: LOG_ACTIONS.EDGE_DELETE,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            poiId: resourceId
          }
        });
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .POST(
    {
      body: {
        id: vandium.types
          .string()
          .min(1)
          .max(25)
          .required(),
        description: vandium.types
          .string()
          .allow("")
          .optional()
      }
    },
    event => {
      if (!userHasAccess(event.jwt, "create:edges")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);

      return createApprovalAction({
        action: APPROVAL_ACTIONS.EDGE_NEW,
        resourceType: RESOURCE_TYPES.EDGE,
        parameters: {
          id: event.body.id,
          description: event.body.description
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.EDGE_CREATE,
            ResourceId: event.body.id,
            ResourceType: RESOURCE_TYPES.EDGE,
            AdditionalInfoObject: {
              id: event.body.id,
              description: event.body.description
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );
