"use strict";
const dynamoDb = require("../../lib/dynamodb");

const approvalManagerPOI = require("./resource/poi");
const approvalManagerEdge = require("./resource/edge");
const approvalManagerUser = require("./resource/user");
const { RESOURCE_TYPES } = require("../../constants");
const { getUserIdOfJWT, throwError } = require("../../lib");

const approveItem = async (id, jwt) => {
  // fetch item from db
  const item = await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      Key: {
        id: id
      }
    })
    .promise()
    .then(item => item.Item);

  // check if item exists
  if (!item || !item.id) {
    return throwError("No Item found", 404);
  }

  const userId = getUserIdOfJWT(jwt);
  console.log(`User ${userId} tries to approve item created by ${item.userId}`);
  // check if user tries to approve own item
  if (userId === item.userId) {
    return throwError("Supervisor cannot approve own Approval Items", 403);
  }
  return processApprovedItem(id, item, jwt);
};

const processApprovedItem = async (id, item, jwt) => {
  switch (item.resourceType) {
    case RESOURCE_TYPES.POI:
      return approvalManagerPOI.processData(
        id,
        item.action,
        item.parameters,
        jwt,
        item.resourceId
      );
    case RESOURCE_TYPES.EDGE:
      return approvalManagerEdge.processData(
        id,
        item.action,
        item.parameters,
        getUserIdOfJWT(jwt),
        item.resourceId
      );
    case RESOURCE_TYPES.USER:
      return approvalManagerUser.processData(
        id,
        item.action,
        item.parameters,
        jwt,
        item.resourceId
      );
    default:
      throw Error(`ApprovalItem ${item.resourceType} not handled`);
  }
};

module.exports = {
  approveItem: approveItem
};
