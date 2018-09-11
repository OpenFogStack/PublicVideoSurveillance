"use strict";
const AWS = require("aws-sdk");

const S3 = new AWS.S3({
  maxRetries: 0,
  region: "eu-central-1"
});

const iotdata = new AWS.IotData({
  endpoint: "a95auszam8l8d.iot.eu-central-1.amazonaws.com"
});

const topic =
  process.env.STAGE == "dev"
    ? "wyf/face-model"
    : `${process.env.STAGE}-wyf/face-model`;

module.exports.outgoingEdgeData = function(event, context) {
  const params = {
    Bucket: process.env.MODEL_BUCKET,
    MaxKeys: 1
  };

  S3.listObjectsV2(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      if (data.Contents[0]) {
        console.log(data);

        const objectId = data.Contents[0].LastModified.valueOf();
        console.log(objectId);
        const name = data.Contents[0].Key;

        const message = {
          modelId: parseInt(objectId),
          timestamp: (Date.now() / 1000) | 0,
          modelKey: data.Contents[0].Key,
          modelBucket: process.env.MODEL_BUCKET,
          edgeTempBucket: process.env.EDGE_TEMP_BUCKET
        };

        const params = {
          topic: topic,
          payload: JSON.stringify(message),
          qos: 1
        };

        iotdata.publish(params, function(err, data) {
          if (err) {
            console.err(err);
          }
        });
      } else {
        console.err("ERROR: No Model to send");
      }
    }
  });
};
