"use strict";
const { callWithError } = require("../../lib");
const Log = require("../logs");

const createLogEntry = async ({
  ActorId,
  Action,
  ResourceId,
  ResourceType,
  AdditionalInfoObject,
  UserGeo = {}
}) => {
  return callWithError(409, Log.createLogEntry, {
    ActorId,
    Action,
    ResourceId,
    ResourceType,
    AdditionalInfoObject,
    UserGeo
  });
};

module.exports = {
  createLogEntry
};
