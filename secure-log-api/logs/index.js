"use strict";
const { callWithError } = require("../../lib");
const { createUserActionLogEntry } = require("./createUserLog");
const { createSystemActionLogEntry } = require("./createSystemLog");

const {
  getAllSystemActionLogs,
  getAllUserActionLogs,
  getSystemActionLogsForComponentType,
  getSystemActionLogsForComponent,
  getUserActionLogsForResourceType,
  getUserActionLogsForResource,
  getUserActionLogsForUser
} = require("./get");

const {
  verifySystemActionLogHash,
  verifyUserActionLogHash
} = require("./verify");

module.exports = {
  async createSystemActionLogEntry({
    ComponentId,
    ComponentType,
    Action,
    AdditionalInfoObject
  }) {
    console.log("test2");
    return callWithError(409, createSystemActionLogEntry, {
      ComponentId,
      ComponentType,
      Action,
      AdditionalInfoObject
    });
  },

  async createUserActionLogEntry({
    UserId,
    Action,
    ResourceId,
    ResourceType,
    AdditionalInfoObject
  }) {
    console.log("test2");
    return callWithError(409, createUserActionLogEntry, {
      UserId,
      Action,
      ResourceId,
      ResourceType,
      AdditionalInfoObject
    });
  },

  async getAllSystemActionLogs() {
    return callWithError(404, getAllSystemActionLogs);
  },
  async getAllUserActionLogs(pageSize, exclusiveStartKey) {
    return callWithError(
      404,
      getAllUserActionLogs,
      pageSize,
      exclusiveStartKey
    );
  },
  async getSystemActionLogsForComponentType(type) {
    return callWithError(404, getSystemActionLogsForComponentType, type);
  },
  async getSystemActionLogsForComponent(type, id) {
    return callWithError(404, getSystemActionLogsForComponent, type, id);
  },
  async getUserActionLogsForResourceType(type, pageSize, exclusiveStartKey) {
    return callWithError(
      404,
      getUserActionLogsForResourceType,
      type,
      pageSize,
      exclusiveStartKey
    );
  },
  async getUserActionLogsForResource(type, id, pageSize, exclusiveStartKey) {
    return callWithError(
      404,
      getUserActionLogsForResource,
      type,
      id,
      pageSize,
      exclusiveStartKey
    );
  },
  async getUserActionLogsForUser(id, pageSize, exclusiveStartKey) {
    return callWithError(
      404,
      getUserActionLogsForUser,
      id,
      pageSize,
      exclusiveStartKey
    );
  },
  async verifyUserActionLogHash(hash) {
    return callWithError(409, verifyUserActionLogHash, hash);
  },
  async verifySystemActionLogHash(hash) {
    return callWithError(409, verifySystemActionLogHash, hash);
  }
};
