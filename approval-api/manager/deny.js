"use strict";
const dynamoDb = require("../../lib/dynamodb");
const {
  createUserActionLogEntry
} = require("../../secure-log-api/log-manager");
const {
  successResponse,
  getUserIdOfJWT,
  throwError
} = require("../../lib");
const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../../constants");

const Image = require("../../frontend-api/images");

const denyItem = async (id, jwt) => {
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
  // check if user tries to approve own item
  if (userId === item.userId) {
    return throwError("Supervisor cannot deny own Approval Items", 403);
  }

  await processDeniedItem(id, item, jwt);

  return successResponse({
    message: "Item was removed within the system"
  });
};

const processDeniedItem = async (id, item, jwt) => {
  switch (item.resourceType) {
    case RESOURCE_TYPES.POI:
      // delete created image from bucket because its not longer needed
      if (item.action === APPROVAL_ACTIONS.POI_IMAGE_ADD) {
        await Image.delete({
          poiId: item.resourceId,
          imageId: item.parameters.imageId,
          isFootage: item.parameters.isFootage,
          isApproved: false
        });
      }
      return deleteItemAndLogDeletion(id, item, jwt);
    case RESOURCE_TYPES.EDGE:
      return deleteItemAndLogDeletion(id, item, jwt);
    case RESOURCE_TYPES.USER:
      return deleteItemAndLogDeletion(id, item, jwt);
    default:
      throw Error(`ApprovalItem ${item.resourceType} not handled`);
  }
};

const deleteItemAndLogDeletion = async (id, item, jwt) => {
  // delete item from db
  await dynamoDb
    .delete({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      Key: { id },
      ConditionExpression: "attribute_exists(id)"
    })
    .promise();

  // log successful deletion
  await createUserActionLogEntry({
    UserId: getUserIdOfJWT(jwt),
    Action: LOG_ACTIONS.APPROVAL_ITEM_REJECTED,
    ResourceId: id,
    ResourceType: item.resourceType,
    AdditionalInfoObject: {
      data: item
    }
  });
  return;
};

module.exports = {
  denyItem: denyItem
};
