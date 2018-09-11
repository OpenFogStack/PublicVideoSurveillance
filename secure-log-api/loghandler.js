"use strict";
const vandium = require("vandium");
const Log = require("./logs");

const {
  successResponse,
  errorResponse,
  getAuth0ClientPublicKey,
  getUserIdOfJWT
} = require("../lib");

const {
  createUserActionLogEntry
} = require("../secure-log-api/log-manager/index");

const {
  RESOURCE_TYPES,
  COMPONENT_TYPES,
  LOG_ACTIONS
} = require("../constants");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

// /logs
exports.alluseractionlogs = vandium
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
    const pageSize =
      event.queryStringParameters && event.queryStringParameters.pageSize
        ? event.queryStringParameters.pageSize
        : undefined;
    const exclusiveStartKey =
      event.queryStringParameters &&
      event.queryStringParameters.exclusiveStartKey
        ? JSON.parse(event.queryStringParameters.exclusiveStartKey)
        : undefined;
    return Log.getAllUserActionLogs(pageSize, exclusiveStartKey)
      .then(log => successResponse(log))
      .catch(error => errorResponse(error.message, error.statusCode));
  });

// /logs/{resourceType}
exports.useractionlogsresourcetype = vandium
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
      const pageSize =
        event.queryStringParameters && event.queryStringParameters.pageSize
          ? event.queryStringParameters.pageSize
          : undefined;
      const exclusiveStartKey =
        event.queryStringParameters &&
        event.queryStringParameters.exclusiveStartKey
          ? JSON.parse(event.queryStringParameters.exclusiveStartKey)
          : undefined;
      return Log.getUserActionLogsForResourceType(
        event.pathParameters.type,
        pageSize,
        exclusiveStartKey
      )
        .then(logs => successResponse(logs))
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /logs/{resourceType}/{resourceId}
exports.useractionlogsresource = vandium
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
      const pageSize =
        event.queryStringParameters && event.queryStringParameters.pageSize
          ? event.queryStringParameters.pageSize
          : undefined;
      const exclusiveStartKey =
        event.queryStringParameters &&
        event.queryStringParameters.exclusiveStartKey
          ? JSON.parse(event.queryStringParameters.exclusiveStartKey)
          : undefined;
      console.log(`exclusiveStartKey = ${exclusiveStartKey}`);
      return Log.getUserActionLogsForResource(
        event.pathParameters.type,
        event.pathParameters.id,
        pageSize,
        exclusiveStartKey
      )
        .then(logs => successResponse(logs))
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

exports.useractionlogsuser = vandium
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
        id: vandium.types
          .string()
          .min(2)
          .required()
      }
    },
    event => {
      const pageSize =
        event.queryStringParameters && event.queryStringParameters.pageSize
          ? event.queryStringParameters.pageSize
          : undefined;
      const exclusiveStartKey =
        event.queryStringParameters &&
        event.queryStringParameters.exclusiveStartKey
          ? JSON.parse(event.queryStringParameters.exclusiveStartKey)
          : undefined;
      return Log.getUserActionLogsForUser(
        decodeURI(event.pathParameters.id),
        pageSize,
        exclusiveStartKey
      )
        .then(logs => successResponse(logs))
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /logs
exports.allsystemactionlogs = vandium
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
    return Log.getAllSystemActionLogs()
      .then(log =>
        successResponse({
          log
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  });

// /logs/{resourceType}
exports.systemactionlogscomponenttype = vandium
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
          .only(Object.values(COMPONENT_TYPES))
          .required()
      }
    },
    event => {
      return Log.getSystemActionLogsForComponentType(event.pathParameters.type)
        .then(logs =>
          successResponse({
            logs
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

// /logs/{resourceType}/{resourceId}
exports.systemactionlogscomponent = vandium
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
          .only(Object.values(COMPONENT_TYPES))
          .required(),
        id: vandium.types
          .string()
          .min(1)
          .required()
      }
    },
    event => {
      return Log.getSystemActionLogsForComponent(
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

// /logs/{resourceType}
exports.verifyuserlog = vandium
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
        hash: vandium.types
          .string()
          .min(2)
          .required()
      }
    },
    event => {
      return Log.verifyUserActionLogHash(event.pathParameters.type)
        .then(logs =>
          successResponse({
            logs
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

exports.verifysystemlog = vandium
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
        hash: vandium.types
          .string()
          .min(2)
          .required()
      }
    },
    event => {
      return Log.verifySystemActionLogHash(event.pathParameters.type)
        .then(logs =>
          successResponse({
            logs
          })
        )
        .catch(error => errorResponse(error.message, error.statusCode));
    }
  );

exports.userlogin = vandium
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
  .POST({}, event => {
    const userId = getUserIdOfJWT(event.jwt);
    return createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_AUTH,
      ResourceId: userId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {}
    })
      .then(() => successResponse({}))
      .catch(error => errorResponse(error.message, error.statusCode));
  });
