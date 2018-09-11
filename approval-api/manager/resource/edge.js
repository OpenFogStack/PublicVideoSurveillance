"use strict";
const Edge = require("../../../edge-api");
const dynamoDb = require("../../../lib/dynamodb");
const {
  successResponse,
  errorResponse,
  getUserIdOfJWT
} = require("../../../lib");

const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../../../constants");

const {
  createUserActionLogEntry
} = require("../../../secure-log-api/log-manager");

const { deleteApprovalItem } = require("../../data/delete");

const processData = async (id, action, parameters, userId, resourceId) => {
  switch (action) {
    case APPROVAL_ACTIONS.EDGE_NEW:
      return createEDGE(id, parameters, userId);
    case APPROVAL_ACTIONS.EDGE_DELETE:
      return deleteEDGE(id, resourceId, userId);
    default:
      throw Error(`ApprovalAction ${action} not handled`);
  }
};

const deleteEDGE = async (id, edgeId, userId) => {
  try {
    const edge = await Edge.deleteById(edgeId);
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.EDGE_DELETE_APPROVAL_ACTION,
      ResourceId: edgeId,
      ResourceType: RESOURCE_TYPES.EDGE
    });
    await deleteApprovalItem(id);
    //delete all approvalitems about that edge as well
    const items = (await dynamoDb
      .scan({
        TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
        FilterExpression: "resourceId = :edgeId",
        ExpressionAttributeValues: { ":edgeId": edgeId }
      })
      .promise()).Items;

    console.log("deleting unnecessary items for edgeid " + edgeid);
    console.log(items);

    await Promise.all(
      items.map(async item => {
        const id = item.id;
        return await dynamoDb
          .delete({
            TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
            Key: { id },
            ConditionExpression: "attribute_exists(id)"
          })
          .promise();
      })
    );
    return successResponse({ edge });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const createEDGE = async (id, parameters, userId) => {
  try {
    const edge = await Edge.create(
      userId,
      parameters.id,
      parameters.description
    );
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.EDGE_CREATE_APPROVAL_ACTION,
      ResourceId: parameters.id,
      ResourceType: RESOURCE_TYPES.EDGE,
      AdditionalInfoObject: {
        edge
      }
    });
    await deleteApprovalItem(id);
    return successResponse({ edge });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

module.exports = {
  processData: processData
};
