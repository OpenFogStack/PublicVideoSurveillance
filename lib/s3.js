"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    s3ForcePathStyle: true,
    endpoint: "http://localhost:" + process.env.OFFLINE_S3_PORT
  };
}

const client = new AWS.S3(options);

module.exports = client;
