"use strict";
const dynamoDb = require("../../lib/dynamodb");
const uuidv1 = require("uuid/v1");

const createApprovalItem = ({
  action,
  resourceType,
  resourceId,
  parameters,
  userId
}) => {
  const newApprovalItem = generateApprovalItem({
    action,
    resourceType,
    resourceId,
    parameters,
    userId
  });

  return dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      Item: newApprovalItem
    })
    .promise()
    .then(res => {});
};

const generateApprovalItem = ({
  action,
  resourceType,
  resourceId,
  parameters,
  userId
}) => {
  const timestamp = new Date().getTime();
  return {
    id: uuidv1(),
    action,
    resourceType,
    resourceId,
    parameters,
    userId,
    createdAt: timestamp
  };
};

module.exports = {
  createApprovalItem: createApprovalItem
};
