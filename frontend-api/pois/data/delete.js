"use strict";
const dynamoDb = require("../../../lib/dynamodb");
const s3 = require("../../../lib/s3");
const { imageKeyBuilder, throwError } = require("../../../lib");
const Image = require("../../images");

const { getPoiById } = require("./read");

const deletePoiById = async id => {
  await dynamoDb
    .delete({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id
      },
      ConditionExpression: "attribute_exists(id)"
    })
    .promise();

  return Image.deleteAllOfPoi(id);
};

const deleteImageByPoiIdAndKey = async (id, imageId, isFootage) => {
  const poi = await getPoiById(id);
  if (!poi || !poi.id) {
    return throwError("Poi not found", 404);
  }

  const KEY = imageKeyBuilder({
    poiId: id,
    imageId
  });
  const image = await s3
    .headObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY
    })
    .promise();

  const hasImage =
    poi.images.findIndex(image => image.imageId === imageId) >= 0;
  if (!hasImage) {
    return throwError("Image not found", 404);
  }

  const newImages = poi.images.filter(image => image.imageId !== imageId);
  await Image.delete({ poiId: id, imageId, isFootage: false });
  return dynamoDb
    .update({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id
      },
      UpdateExpression: "SET #images=:new_images",
      ConditionExpression: "attribute_exists(#images)",
      ExpressionAttributeNames: {
        "#images": "images"
      },
      ExpressionAttributeValues: {
        ":new_images": newImages
      },
      ReturnValues: "ALL_NEW"
    })
    .promise();
};

const deleteFootageByPoiIdAndKey = async (id, imageId) => {
  const poi = await getPoiById(id);
  if (!poi || !poi.id) {
    return throwError("Poi not found", 404);
  }
  const KEY = imageKeyBuilder({
    poiId: id,
    imageId,
    isFootage: true,
    isApproved: true
  });
  const image = await s3
    .headObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY
    })
    .promise();
  const hasFootage =
    poi.footages.findIndex(footage => footage.imageId === imageId) >= 0;
  if (!hasFootage) {
    return throwError("Footage not found", 404);
  }
  const newFootages = poi.footages.filter(
    footage => footage.imageId !== imageId
  );
  await Image.delete({ poiId: id, imageId, isFootage: true });
  return dynamoDb
    .update({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id
      },
      UpdateExpression: "SET #footages=:new_footages",
      ConditionExpression: "attribute_exists(#footages)",
      ExpressionAttributeNames: {
        "#footages": "footages"
      },
      ExpressionAttributeValues: {
        ":new_footages": newFootages
      },
      ReturnValues: "ALL_NEW"
    })
    .promise();
};

const deleteUserByPoiIdAndUserId = async (id, userId) => {
  const poi = await getPoiById(id);
  if (!poi || !poi.id) {
    return throwError("Poi not found", 404);
  }

  const hasUser = poi.users.findIndex(user => user === userId) >= 0;
  if (!hasUser) {
    return throwError("User not found", 404);
  }
  const newUsers = poi.users.filter(user => user !== userId);

  return dynamoDb
    .update({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id
      },
      UpdateExpression: "SET #users=:new_users",
      ConditionExpression: "attribute_exists(#users)",
      ExpressionAttributeNames: {
        "#users": "users"
      },
      ExpressionAttributeValues: {
        ":new_users": newUsers
      },
      ReturnValues: "ALL_NEW"
    })
    .promise();
};
module.exports = {
  deletePoiById: deletePoiById,
  deleteImageByPoiIdAndKey: deleteImageByPoiIdAndKey,
  deleteFootageByPoiIdAndKey: deleteFootageByPoiIdAndKey,
  deleteUserByPoiIdAndUserId: deleteUserByPoiIdAndUserId
};
