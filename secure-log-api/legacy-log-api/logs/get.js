"use strict";
const dynamoDb = require("../../lib/dynamodb");
const { getUser } = require("../../lib/userHelper");

const getAllLogs = () =>
  dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_LOG
    })
    .promise()
    .then(items => items.Items);

const getLogsForResource = async (type, id) =>
  dynamoDb
    .query({
      TableName: process.env.DYNAMODB_TABLE_LOG,
      IndexName: process.env.DYNAMODB_TABLE_LOG_INDEX_RESOURCE_TYPE_AND_ID,
      KeyConditionExpression: "ResourceId = :id AND ResourceType = :type",
      ExpressionAttributeValues: {
        ":id": id,
        ":type": type
      }
    })
    .promise()
    .then(items => {
      return Promise.all(
        items.Items.map(async item => await enhanceItem(item))
      );
    });

const getLogsForResourceType = async type =>
  dynamoDb
    .query({
      TableName: process.env.DYNAMODB_TABLE_LOG,
      IndexName: process.env.DYNAMODB_TABLE_LOG_INDEX_RESOURCE_TYPE_AND_ID,
      KeyConditionExpression: "ResourceType = :type",
      ExpressionAttributeValues: {
        ":type": type
      }
    })
    .promise()
    .then(items => {
      return Promise.all(
        items.Items.map(async item => await enhanceItem(item))
      );
    });

const enhanceItem = async item => {
  try {
    const user = await getUser(item.UserId);
    item.Actor = Object.assign({}, user, { userId: item.Actor });
  } catch (error) {
    item.Actor = { userId: item.UserId };
  }
  return item;
};

module.exports = {
  getAllLogs: getAllLogs,
  getLogsForResourceType: getLogsForResourceType,
  getLogsForResource: getLogsForResource
};
