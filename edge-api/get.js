"use strict";
const dynamoDb = require("../lib/dynamodb");
const { throwError } = require("../lib");

const getEdgeById = async (userId, id) => {
  const item = await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      KeyConditionExpression: "createdBy = :c",
      ExpressionAttributeValues: {
        ":c": userId
      },
      Key: {
        id: id
      }
    })
    .promise();

  if (item && item.Item && item.Item.id) {
    return item.Item;
  }
  return throwError("No Item found", 404);
};

const getAllEdges = async userId => {
  const allItems = await dynamoDb
    .scan({
      ProjectionExpression: "id,description",
      TableName: process.env.DYNAMODB_TABLE_EDGES
    })
    .promise();

  const restrictedItems = await dynamoDb
    .query({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      ProjectionExpression: "id,description",
      IndexName: process.env.DYNAMODB_TABLE_EDGES + "_SI",
      KeyConditionExpression: "createdBy = :createdBy",
      ExpressionAttributeValues: {
        ":createdBy": userId
      }
    })
    .promise();

  return allItems.Items.map(item => {
    if (
      restrictedItems.Items.some(
        restrictedItem => restrictedItem.id === item.id
      )
    ) {
      item.readAccess = "X";
    } else {
      item.readAccess = "";
    }
    return item;
  });
};

module.exports = {
  getEdgeById: getEdgeById,
  getAllEdges: getAllEdges
};
