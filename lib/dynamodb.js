"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const onlineOptions = {
  convertEmptyValues: true
};

let options = onlineOptions;

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    convertEmptyValues: true,
    endpoint: "http://localhost:" + process.env.OFFLINE_DYNAMODB_PORT
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;

module.exports.onlineClient = new AWS.DynamoDB.DocumentClient(onlineOptions);
