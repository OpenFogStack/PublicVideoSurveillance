"use strict";
const Joi = require("joi");
const {
  callWithError,
  getUserAuthOfJWT,
  getUserIdOfJWT,
  isSupervisor,
  throwError
} = require("../lib");
const { createApprovalItem } = require("./data/create");
const { getAllApprovalItems, getAllRequests } = require("./data/get");
const { approveItem } = require("./manager/approve");
const { denyItem } = require("./manager/deny");
const { APPROVAL_ACTIONS, RESOURCE_TYPES } = require("../constants");

module.exports = {
  async createApprovalAction({
    action,
    resourceType,
    resourceId,
    parameters,
    userId
  }) {
    const validationErrorMessagePrefix = "createApprovalAction() ";
    Joi.assert(
      action,
      Joi.any()
        .valid(Object.values(APPROVAL_ACTIONS))
        .required(),
      validationErrorMessagePrefix + "action"
    );
    Joi.assert(
      resourceType,
      Joi.any()
        .valid(Object.values(RESOURCE_TYPES))
        .required(),
      validationErrorMessagePrefix + "resourceType"
    );
    Joi.assert(
      userId,
      Joi.string()
        .invalid("")
        .required(),
      validationErrorMessagePrefix + "userId"
    );
    return callWithError(409, createApprovalItem, {
      action,
      resourceType,
      resourceId,
      parameters,
      userId
    });
  },
  async getAll(jwt) {
    const userAuth = getUserAuthOfJWT(jwt);
    const userId = getUserIdOfJWT(jwt);
    if (isSupervisor(userAuth.roles) && userId) {
      return callWithError(404, getAllApprovalItems, userId);
    }
    return throwError("Only Supervisors can see ApprovalItems", 403);
  },
  async getAllRequests(jwt) {
    const userAuth = getUserAuthOfJWT(jwt);
    const userId = getUserIdOfJWT(jwt);
    if (userId) {
      return callWithError(404, getAllRequests, userId);
    }
    return throwError("Not authorized", 403);
  },
  async approveItem(id, jwt) {
    const userAuth = getUserAuthOfJWT(jwt);
    if (isSupervisor(userAuth.roles)) {
      return callWithError(404, approveItem, id, jwt);
    }
    return throwError("Only Supervisors can approve ApprovalItems", 403);
  },
  async denyItem(id, jwt) {
    const userAuth = getUserAuthOfJWT(jwt);
    if (isSupervisor(userAuth.roles)) {
      return callWithError(404, denyItem, id, jwt);
    }
    return throwError("Only Supervisors can deny ApprovalItems", 403);
  }
};
