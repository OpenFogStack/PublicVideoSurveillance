"use strict";
const { callWithError } = require("../../lib");
const { createUserActionLogEntry } = require("./createUserLog");
const { createSystemActionLogEntry } = require("./createSystemLog");

//TODO
const {
  getAllLogs,
  getLogsForResource,
  getLogsForResourceType
} = require("./get");

module.exports = {
  async createSystemActionLogEntry({
    ComponentId,
    ComponentType,
    Action,
    AdditionalInfoObject
  }) {
    console.log("test2");
    return callWithError(409, createLogEntry, {
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
    AdditionalInfoObject,
    UserGeo = {}
  }) {
    return callWithError(409, createUserActionLogEntry, {
      ActorId,
      Action,
      ResourceId,
      ResourceType,
      AdditionalInfoObject,
      UserGeo
    });
  },
  //Get all Log-Entries
  async getAll() {
    return callWithError(404, getAllLogs);
  },
  //Get all Log-Entries for a resources of a given type
  async getByResourceType(resourceType) {
    return callWithError(404, getLogsForResourceType, resourceType);
  },
  //Get all Log-Entries for a single resource
  async getByResource(resourceType, resourceId) {
    return callWithError(404, getLogsForResource, resourceType, resourceId);
  }
};
