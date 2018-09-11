"use strict";
var AWS = require("aws-sdk");
var batch = new AWS.Batch({ apiVersion: "2016-08-10", region: "eu-central-1" });
const dynamoDb = require("../../lib/dynamodb");
const {
  LOG_ACTIONS,
  AWS_RESOURCE
} = require("../../constants");

module.exports.startTraining = (event, context, callback) => {
  var paramsDynamoDB = {
    TableName: process.env.DYNAMODB_TABLE_MODEL_HELPER,
    Key: { id: process.env.POI_IMAGES_BUCKET }
  };

  var paramsBatch = {
    jobDefinition: "BATCH-JOBDEFI-Fog-Computing",
    jobName: "ModelTraining",
    jobQueue: "BATCH-QUEUE-Fog-Computing",
    containerOverrides: {
      environment: [
        { name: "INPUT_BUCKET", value: process.env.POI_IMAGES_BUCKET },
        { name: "OUTPUT_BUCKET", value: process.env.MODEL_BUCKET }
      ]
    }
  };

  dynamoDb.get(paramsDynamoDB, function(err, data) {
    if (err) {
      console.log("Cannot fetch data from DynamoDB");
    }

    if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
      console.log(
        "Data found in DynamoDB for " + process.env.POI_IMAGES_BUCKET
      );
      console.log("Start AWS Batch");

      //Start AWS Batch Job
      batch.submitJob(paramsBatch, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } // an error occurred
        else {
          dynamoDb.delete(paramsDynamoDB, function(err, data) {
            if (err) {
              console.log("FAIL:  Error deleting item from dynamodb - " + err);
            }
          });
        }
      });
    } else {
      console.log("There is no need to start a new trainig job!");
    }
  });
};
