"use strict";
const dynamoDb = require("../../lib/dynamodb");
const { APPROVAL_ACTIONS } = require("../../constants");
const { getUser } = require("../../lib/userHelper");
const { getPublicUrl } = require("../../frontend-api/images");

const getAllApprovalItems = async requestingUserId =>
  dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      FilterExpression: "userId <> :creatorUserId",
      ExpressionAttributeValues: { ":creatorUserId": requestingUserId }
    })
    .promise()
    .then(items => {
      return Promise.all(items.Items.map(async item => await handleItem(item)));
    });

const getAllRequests = async requestingUserId =>
  dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      FilterExpression: "userId = :creatorUserId",
      ExpressionAttributeValues: { ":creatorUserId": requestingUserId }
    })
    .promise()
    .then(items => {
      return Promise.all(items.Items.map(async item => await handleItem(item)));
    });

const doesApprovalItemExist = async (
  action,
  resourceType,
  resourceId,
  userId
) => {
  const items = (await dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      FilterExpression:
        "#action = :action AND resourceType = :resourceType AND resourceId = :resourceId AND userId = :userId",
      ExpressionAttributeValues: {
        ":action": action,
        ":resourceType": resourceType,
        ":resourceId": resourceId,
        ":userId": userId
      },
      ExpressionAttributeNames: {
        // prevent conflicts with reserved words
        // @see: http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
        "#action": "action"
      }
    })
    .promise()).Items;
  return items.length > 0;
};

const handleItem = async item => {
  switch (item.action) {
    case APPROVAL_ACTIONS.POI_IMAGE_ADD:
      item.imageUrl = await getPublicUrl(
        item.resourceId,
        item.parameters.imageId,
        item.parameters.isFootage,
        false
      );
      break;
    case APPROVAL_ACTIONS.POI_IMAGE_DELETE:
      item.imageUrl = await getPublicUrl(
        item.resourceId,
        item.parameters.imageId,
        false,
        true
      );
      break;
    case APPROVAL_ACTIONS.POI_FOOTAGE_DELETE:
      item.imageUrl = await getPublicUrl(
        item.resourceId,
        item.parameters.imageId,
        true,
        true
      );
      break;
  }
  try {
    const user = await getUser(item.userId);
    item.user = user;
    if (item.parameters && item.parameters.userId) {
      const paramUser = await getUser(item.parameters.userId);
      item.parameters.user = paramUser;
    }
  } catch (error) {
    item.user = { userId: item.userId };
  }

  return item;
};

module.exports = {
  getAllApprovalItems: getAllApprovalItems,
  getAllRequests: getAllRequests,
  doesApprovalItemExist: doesApprovalItemExist
};
