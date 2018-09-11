"use strict";
const dynamoDb = require("../../lib/dynamodb");

const deleteApprovalItem = async id =>
  dynamoDb
    .delete({
      TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
      Key: { id },
      ConditionExpression: "attribute_exists(id)"
    })
    .promise();

module.exports = {
  deleteApprovalItem: deleteApprovalItem
};
