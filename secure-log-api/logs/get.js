"use strict";
const dynamoDb = require("../../lib/dynamodb");
const { getUser } = require("../../lib/userHelper");
const standardPageSize = 20;

const getAllSystemActionLogs = async () =>
  (await dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_SYSTEM_LOG
    })
    .promise()).Items;

const getSystemActionLogsForComponentType = async type =>
  (await dynamoDb
    .query({
      TableName: process.env.DYNAMODB_TABLE_SYSTEM_LOG,
      IndexName: process.env.DYNAMODB_TABLE_SYSTEM_LOG_INDEX_COMPONENT_ACTION,
      KeyConditionExpression: "ResourceType = :type",
      ExpressionAttributeValues: {
        ":type": type
      }
    })
    .promise()).Items;

const getSystemActionLogsForComponent = async (type, id) =>
  (await dynamoDb
    .query({
      TableName: process.env.DYNAMODB_TABLE_LOG,
      IndexName: process.env.DYNAMODB_TABLE_SYSTEM_LOG_INDEX_COMPONENT_ACTION,
      KeyConditionExpression: "ResourceId = :id AND ResourceType = :type",
      ExpressionAttributeValues: {
        ":id": id,
        ":type": type
      }
    })
    .promise()).Items;

const getAllUserActionLogs = async (
  pageSize = standardPageSize,
  exclusiveStartKey
) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_LOG,
    Limit: pageSize,
    ExclusiveStartKey: exclusiveStartKey
  };
  const itemsAnswer = await dynamoDb.scan(params).promise();
  const logs = await Promise.all(
    itemsAnswer.Items.map(async item => await enhanceItem(item))
  );
  return {
    Count: itemsAnswer.Count,
    ScannedCount: itemsAnswer.ScannedCount,
    LastEvaluatedKey: itemsAnswer.LastEvaluatedKey,
    logs
  };
};

const getUserActionLogsForUser = async (
  id,
  pageSize = standardPageSize,
  exclusiveStartKey
) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_LOG,
    IndexName: process.env.DYNAMODB_TABLE_LOG_INDEX_USER_ACTION,
    KeyConditionExpression: "UserId = :id",
    ExpressionAttributeValues: {
      ":id": id
    },
    Limit: pageSize,
    ExclusiveStartKey: exclusiveStartKey
  };
  console.log(`get logs for user: ${id}`);
  const itemsAnswer = await dynamoDb.query(params).promise();
  const logs = await Promise.all(
    itemsAnswer.Items.map(async item => await enhanceItem(item))
  );
  return {
    Count: itemsAnswer.Count,
    ScannedCount: itemsAnswer.ScannedCount,
    LastEvaluatedKey: itemsAnswer.LastEvaluatedKey,
    logs
  };
};

const getUserActionLogsForResourceType = async (
  type,
  pageSize = standardPageSize,
  exclusiveStartKey
) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_LOG,
    IndexName: process.env.DYNAMODB_TABLE_LOG_INDEX_RESOURCE_ACTION,
    KeyConditionExpression: "ResourceType = :type",
    ExpressionAttributeValues: {
      ":type": type
    },
    Limit: pageSize,
    ExclusiveStartKey: exclusiveStartKey
  };
  const itemsAnswer = await dynamoDb.query(params).promise();
  const logs = await Promise.all(
    itemsAnswer.Items.map(async item => await enhanceItem(item))
  );
  return {
    Count: itemsAnswer.Count,
    ScannedCount: itemsAnswer.ScannedCount,
    LastEvaluatedKey: itemsAnswer.LastEvaluatedKey,
    logs
  };
};

const getUserActionLogsForResource = async (
  type,
  id,
  pageSize = standardPageSize,
  exclusiveStartKey
) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_LOG,
    IndexName: process.env.DYNAMODB_TABLE_LOG_INDEX_RESOURCE_ACTION,
    KeyConditionExpression: "ResourceId = :id AND ResourceType = :type",
    ExpressionAttributeValues: {
      ":id": id,
      ":type": type
    },
    Limit: pageSize,
    ExclusiveStartKey: exclusiveStartKey
  };
  console.log(params);
  const itemsAnswer = await dynamoDb.query(params).promise();
  const logs = await Promise.all(
    itemsAnswer.Items.map(async item => await enhanceItem(item))
  );
  return {
    Count: itemsAnswer.Count,
    ScannedCount: itemsAnswer.ScannedCount,
    LastEvaluatedKey: itemsAnswer.LastEvaluatedKey,
    logs
  };
};

const enhanceItem = async item => {
  try {
    const user = await getUser(item.UserId);
    item.Actor = Object.assign({}, user);
  } catch (error) {
    item.Actor = { userId: item.UserId };
  }
  return item;
};

module.exports = {
  getAllSystemActionLogs: getAllSystemActionLogs,
  getAllUserActionLogs: getAllUserActionLogs,
  getSystemActionLogsForComponentType: getSystemActionLogsForComponentType,
  getSystemActionLogsForComponent: getSystemActionLogsForComponent,
  getUserActionLogsForResourceType: getUserActionLogsForResourceType,
  getUserActionLogsForResource: getUserActionLogsForResource,
  getUserActionLogsForUser: getUserActionLogsForUser
};
