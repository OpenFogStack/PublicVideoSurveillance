"use strict";

const uuidv1 = require("uuid/v1");

const AWS = require("aws-sdk");

const S3 = new AWS.S3();

const DynamoDB = new AWS.DynamoDB();

module.exports.incomingEdgeData = function(event, context) {
  const message = event;

  console.log(event);
  console.log(message);

  // console.log(3);
  // console.log(4);

  console.log(message);

  //const image = decodeBase64Image(message.imageData).data;

  const SOURCE = `${message.imageBucket}/${message.imageKey}`;

  const imageId = uuidv1();

  const KEY = `${message.poiId}/results/${imageId}.${message.imageFormat}`;

  const timestamp = new Date().getTime();

  let contenttype = "image/jpeg";
  
  if (message.imageFormat == "mp4") {
    contenttype = "video/mp4";
  }
  
  S3.copyObject(
    {
      Bucket: process.env.POI_IMAGES_BUCKET,
      CopySource: SOURCE,
      Key: KEY,
      ContentType: contenttype,
      ACL: "public-read"
    },
    function(err, data) {
      if (err) console.log(err);
      // an error occurred
      else {
        console.log(
          "Success uploading picture, updating DynamoDB now",
          message.poiId
        );
         
        let dynamoImageId = imageId.toString();
        
        if (message.imageFormat == "mp4") {
          dynamoImageId = dynamoImageId + "-video";
        }
        
        DynamoDB.updateItem(
          {
            TableName: process.env.DYNAMODB_TABLE_POIS,
            Key: {
              id: {
                S: message.poiId.toString()
              }
            },
            UpdateExpression:
              "SET #footages=list_append(#footages, :new_footage)",
            ConditionExpression: "attribute_exists(#footages)",
            ExpressionAttributeNames: {
              "#footages": "footages"
            },
            ExpressionAttributeValues: {
              ":new_footage": {
                L: [
                  {
                    M: {
                      imageId: {
                        S: dynamoImageId
                      }
                    }
                  }
                ]
              }
            },
            ReturnValues: "ALL_NEW"
          },
          function(err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log("Success adding footage to dynamo", data);
            }
          }
        );
      }
    }
  );
};
