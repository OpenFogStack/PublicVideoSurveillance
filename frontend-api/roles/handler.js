"use strict";

const vandium = require("vandium");
const {
  createUserActionLogEntry
} = require("../../secure-log-api/log-manager/index");
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
const Role = require("./index");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /roles
exports.collection = vandium
  .api()
  .cors({
    allowOrigin: "*",
    allowCredentials: true
  })
  .jwt({
    algorithm: "RS256",
    publicKey: AUTH0_CLIENT_PUBLIC_KEY,
    token: "headers.Authorization"
  })
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:roles")) {
      return errorResponse("Forbidden", 403);
    }
    return Role.getAll()
      .then(res => {
        return res;
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .POST(
    {
      body: {
        name: vandium.types.string().required(),
        permissions: vandium.types.array().required()
      }
    },
    event => {
      if (!userHasAccess(event.jwt, "create:roles")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);

      return createApprovalAction({
        action: APPROVAL_ACTIONS.ROLE_NEW,
        resourceType: RESOURCE_TYPES.USER,
        parameters: {
          name: event.body.name,
          permissions: event.body.permissions
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.ROLE_CREATE_APPROVAL_ACTION,
            ResourceId: userId,
            ResourceType: RESOURCE_TYPES.USER,
            AdditionalInfoObject: {
              name: event.body.name,
              permissions: event.body.permissions
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /roles/{roleId}
exports.item = vandium
  .api()
  .cors({
    allowOrigin: "*",
    allowCredentials: true
  })
  .jwt({
    algorithm: "RS256",
    publicKey: AUTH0_CLIENT_PUBLIC_KEY,
    token: "headers.Authorization"
  })
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:roles")) {
      return errorResponse("Forbidden", 403);
    }
    return Role.getById(event.pathParameters.id)
      .then(res => {
        return res;
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .PUT(
    {
      body: {
        name: vandium.types.string().required(),
        permissions: vandium.types.array().required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "update:roles")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);
      const action = APPROVAL_ACTIONS.ROLE_UPDATE;
      const resourceType = RESOURCE_TYPES.USER;
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
          name: event.body.name,
          permissions: event.body.permissions
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.ROLE_UPDATE_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              name: event.body.name,
              permissions: event.body.permissions
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  )
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:roles")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.ROLE_DELETE;
    const resourceType = RESOURCE_TYPES.USER;
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
          Action: LOG_ACTIONS.ROLE_DELETE_APPROVAL_ACTION,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            roleId: event.pathParameters.id
          }
        });
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });
