"use strict";
const dynamoDb = require("../../../lib/dynamodb");
const s3 = require("../../../lib/s3");
const { imageKeyBuilder, throwError } = require("../../../lib");
const Images = require("../../images");

const { getPoiById } = require("./read");

const addImageToPoi = async (poiId, imageId, isFootage) => {
  const KEY = imageKeyBuilder({ poiId, imageId, isFootage });
  const poi = await getPoiById(poiId);
  const imageExists = await s3
    .headObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY
    })
    .promise()
    .catch(err => {
      // fix weird "Forbidden: null" errors when image does not exist
      if (err.code.includes("Forbidden")) {
        return throwError("Image not found", 404);
      }
    });

  const images = isFootage ? poi.footages : poi.images;

  if (images.findIndex(i => i.imageId === imageId) >= 0) {
    return throwError("Image already added", 409);
  }
  if (!isFootage) {
    await Images.approve(poiId, imageId);
  }

  const newImage = {
    imageId: imageId
  };

  const UpdateExpression = isFootage
    ? "SET #footages=list_append(#footages, :new_footage)"
    : "SET #images=list_append(#images, :new_image)";

  const ConditionExpression = isFootage
    ? "attribute_exists(#footages)"
    : "attribute_exists(#images)";

  const ExpressionAttributeNames = isFootage
    ? {
        "#footages": "footages"
      }
    : {
        "#images": "images"
      };
  const ExpressionAttributeValues = isFootage
    ? {
        ":new_footage": [newImage]
      }
    : {
        ":new_image": [newImage]
      };
  return dynamoDb
    .update({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id: poiId
      },
      UpdateExpression,
      ConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    })
    .promise();
};

const addUserToPoi = async (poiId, userId) => {
  const poi = await getPoiById(poiId);
  if (!poi || !poi.id) {
    return throwError("Poi not found", 404);
  }

  const hasUser = poi.users.findIndex(user => user === userId) >= 0;
  if (hasUser) {
    return throwError("User already added", 409);
  }

  const UpdateExpression = "SET #users=list_append(#users, :new_user)";

  const ConditionExpression = "attribute_exists(#users)";

  const ExpressionAttributeNames = {
    "#users": "users"
  };
  const ExpressionAttributeValues = {
    ":new_user": [userId]
  };
  return dynamoDb
    .update({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id: poiId
      },
      UpdateExpression,
      ConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    })
    .promise();
};

module.exports = {
  addImageToPoi: addImageToPoi,
  addUserToPoi: addUserToPoi
};
