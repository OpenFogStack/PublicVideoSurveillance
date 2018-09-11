"use strict";
const vandium = require("vandium");

const {
  successResponse,
  errorResponse,
  getAuth0ClientPublicKey,
  userHasAccess
} = require("../lib");

const ApprovalItem = require("./index");

const AUTH0_CLIENT_PUBLIC_KEY = getAuth0ClientPublicKey();

exports.approvalitems = vandium
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
  .PUT(
    {
      body: {
        isApproved: vandium.types.boolean()
      }
    },
    event => {
      if (!userHasAccess(event.jwt, "update:approvalItems")) {
        return errorResponse("Forbidden", 403);
      }
      if (event.body.isApproved) {
        return ApprovalItem.approveItem(event.pathParameters.id, event.jwt)
          .then(result => {
            return result;
          })
          .catch(error => errorResponse(error.message, error.statusCode));
      } else {
        return ApprovalItem.denyItem(event.pathParameters.id, event.jwt)
          .then(result => {
            return result;
          })
          .catch(error => errorResponse(error.message, error.statusCode));
      }
    }
  )
  .GET(event => {
    if (!userHasAccess(event.jwt, "read:approvalitems")) {
      return errorResponse("Forbidden", 403);
    }
    return ApprovalItem.getAll(event.jwt)
      .then(approvalItems =>
        successResponse({
          approvalItems
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  });

exports.requests = vandium
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
    return ApprovalItem.getAllRequests(event.jwt)
      .then(requests =>
        successResponse({
          requests
        })
      )
      .catch(error => errorResponse(error.message, error.statusCode));
  });
