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
const User = require("./index");
const UserCache = require("./cache");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

const USER_CACHE_TIMEOUT_IN_MINUTES = 5;

const isOutdatedUser = lastUpdated => {
  return (
    new Date().getTime() - lastUpdated >
    USER_CACHE_TIMEOUT_IN_MINUTES * 60 * 1000
  );
};

exports.cacheduser = async event => {
  console.log(`cacheduser called with userId: ${event.userId}`);
  let cachedUser;
  try {
    cachedUser = await UserCache.getUser(event.userId);
  } catch (error) {
    cachedUser = undefined;
  }

  try {
    if (
      cachedUser &&
      cachedUser.lastUpdated &&
      !isOutdatedUser(cachedUser.lastUpdated)
    ) {
      delete cachedUser.lastUpdated;
      console.log(`${event.userId} CACHE HIT`);
      return cachedUser;
    }
  } catch (error) {}

  try {
    const userResponse = await User.getById(event.userId);
    const user = userResponse.body.result;
    await UserCache.createUser(event.userId, user);
    console.log(`${event.userId} CACHE MISS`);
    return user;
  } catch (error) {
    return error;
  }
};

// /users
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
    if (!userHasAccess(event.jwt, "read:users")) {
      return errorResponse("Forbidden", 403);
    }
    return User.getAll()
      .then(res => {
        return res;
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .POST(
    {
      body: {
        data: vandium.types
          .object()
          .keys({
            connection: vandium.types.string().required(),
            email: vandium.types.email().required(),
            password: vandium.types
              .string()
              .min(6)
              .required()
          })
          .required()
      }
    },
    event => {
      if (!userHasAccess(event.jwt, "create:users")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);

      return createApprovalAction({
        action: APPROVAL_ACTIONS.USER_NEW,
        resourceType: RESOURCE_TYPES.USER,
        parameters: {
          data: event.body.data
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.USER_CREATE_APPROVAL_ACTION,
            ResourceId: userId,
            ResourceType: RESOURCE_TYPES.USER,
            AdditionalInfoObject: {
              data: event.body.data
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /users/{userId}
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
    if (!userHasAccess(event.jwt, "read:users")) {
      return errorResponse("Forbidden", 403);
    }
    return User.getById(event.pathParameters.id)
      .then(res => {
        return res;
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .PUT(
    {
      body: {
        data: vandium.types
          .object()
          .keys({
            connection: vandium.types.string().required()
          })
          .required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "update:users")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);
      const action = APPROVAL_ACTIONS.USER_UPDATE;
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
          data: event.body.data
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.USER_UPDATE_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              data: event.body.data
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  )
  .DELETE(async event => {
    if (!userHasAccess(event.jwt, "delete:users")) {
      return errorResponse("Forbidden", 403);
    }
    const userId = getUserIdOfJWT(event.jwt);
    const action = APPROVAL_ACTIONS.USER_DELETE;
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
          Action: LOG_ACTIONS.USER_DELETE_APPROVAL_ACTION,
          ResourceId: resourceId,
          ResourceType: resourceType,
          AdditionalInfoObject: {
            auth0UserId: event.pathParameters.id
          }
        });
        return successResponse({}, 200);
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  });

// /users/{userId}/roles
exports.roles = vandium
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
    if (!userHasAccess(event.jwt, "read:users")) {
      return errorResponse("Forbidden", 403);
    }
    return User.getRolesOfUser(event.pathParameters.id)
      .then(res => {
        return res;
      })
      .catch(error => errorResponse(error.message, error.statusCode));
  })
  .PATCH(
    {
      body: {
        roleId: vandium.types.string().required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "update:users")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);
      const action = APPROVAL_ACTIONS.USER_ADD_ROLE;
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
          roleId: event.body.roleId
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.USER_ROLE_ADD_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              roleId: event.body.roleId
            }
          });
          return successResponse({});
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  )
  .DELETE(
    {
      body: {
        roleId: vandium.types.string().required()
      }
    },
    async event => {
      if (!userHasAccess(event.jwt, "update:users")) {
        return errorResponse("Forbidden", 403);
      }
      const userId = getUserIdOfJWT(event.jwt);
      const action = APPROVAL_ACTIONS.USER_REMOVE_ROLE;
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
          roleId: event.body.roleId
        },
        userId: userId
      })
        .then(_ => {
          createUserActionLogEntry({
            UserId: userId,
            Action: LOG_ACTIONS.USER_ROLE_REMOVE_APPROVAL_ACTION,
            ResourceId: resourceId,
            ResourceType: resourceType,
            AdditionalInfoObject: {
              roleId: event.body.roleId
            }
          });
          return successResponse({}, 200);
        })
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );
