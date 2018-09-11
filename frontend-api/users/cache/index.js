"use strict";
const { onlineClient } = require("../../../lib/dynamodb");

const createUser = (userId, user) => {
  const newUser = generateUser(userId, user);
  return onlineClient
    .put({
      TableName: process.env.DYNAMODB_TABLE_USER_CACHE,
      Item: newUser
    })
    .promise()
    .then(res => newUser);
};

const getUser = userId =>
  onlineClient
    .get({
      TableName: process.env.DYNAMODB_TABLE_USER_CACHE,
      Key: {
        userId: userId
      }
    })
    .promise()
    .then(item => {
      if (item && item.Item && item.Item.userId) {
        return item.Item;
      }
      return throwError("No Item found", 404);
    });

const generateUser = (userId, user) => {
  const timestamp = new Date().getTime();
  return Object.assign({}, user, {
    userId,
    lastUpdated: timestamp
  });
};

module.exports = {
  createUser: createUser,
  getUser: getUser
};
