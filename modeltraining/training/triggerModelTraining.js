"use strict";
const dynamoDb = require("../../lib/dynamodb");

module.exports.triggerTraining = (event, context, callback) => {
  console.log("Trigger model training for " + process.env.POI_IMAGES_BUCKET);
  dynamoDb.put(
    {
      TableName: process.env.DYNAMODB_TABLE_MODEL_HELPER,
      Item: { id: process.env.POI_IMAGES_BUCKET }
    },
    function(err, data) {
      if (err) {
        console.log(
          "Error: Trigger model training for " + process.env.POI_IMAGES_BUCKET
        );
      }
    }
  );
};
