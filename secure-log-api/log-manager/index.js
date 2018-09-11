"use strict";
const { callWithError } = require("../../lib");
const Log = require("../logs");

const createUserActionLogEntry = async ({
  UserId,
  Action,
  ResourceId,
  ResourceType,
  AdditionalInfoObject
}) => {
  return callWithError(409, Log.createUserActionLogEntry, {
    UserId,
    Action,
    ResourceId,
    ResourceType,
    AdditionalInfoObject
  });
};

const createSystemActionLogEntry = async ({
  ComponentId,
  ComponentType,
  Action,
  AdditionalInfoObject
}) => {
  return callWithError(409, Log.createSystemActionLogEntry, {
    ComponentId,
    ComponentType,
    Action,
    AdditionalInfoObject
  });
};

module.exports = {
  createUserActionLogEntry: createUserActionLogEntry,
  createSystemActionLogEntry: createSystemActionLogEntry
};
