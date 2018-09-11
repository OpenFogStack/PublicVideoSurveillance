"use strict";
const dynamoDb = require("../../../lib/dynamodb");

const createPoi = (userId, id, firstName, lastName, reason, description) => {
  const newPoi = generateNewPoi(
    userId,
    id,
    firstName,
    lastName,
    reason,
    description
  );
  return dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Item: newPoi,
      ConditionExpression: "attribute_not_exists(id)"
    })
    .promise()
    .then(res => newPoi);
};

const generateNewPoi = (
  userId,
  id,
  firstName,
  lastName,
  reason,
  description
) => {
  const timestamp = new Date().getTime();
  return {
    id,
    firstName,
    lastName,
    reason,
    description,
    createdAt: timestamp,
    createdBy: userId,
    approved: false,
    images: [],
    footages: [],
    users: [userId]
  };
};

module.exports = {
  createPoi: createPoi
};
