"use strict";
const dynamoDb = require("../../../lib/dynamodb");
const { getUser } = require("../../../lib/userHelper");
const Images = require("../../images");
const {
  throwError,
  getUserAuthOfJWT,
  getUserIdOfJWT,
  isSupervisor
} = require("../../../lib");

const getPoiById = id =>
  dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_POIS,
      Key: {
        id: id
      }
    })
    .promise()
    .then(item => {
      if (item && item.Item && item.Item.id) {
        return item.Item;
      }
      return throwError("No Item found", 404);
    });

const getAllPois = () =>
  dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE_POIS
    })
    .promise()
    .then(items => items.Items);

const getPoiWithImageUrls = async id => {
  const poi = await getPoiById(id);
  const imagesWithUrls = poi.images.map(async image => {
    const imageUrl = await Images.getPublicUrl(id, image.imageId, false, true);
    return {
      imageId: image.imageId,
      imageUrl
    };
  });
  poi.images = Promise.all(imagesWithUrls);
  return poi;
};

const getPoiWithFootageUrls = async id => {
  const poi = await getPoiById(id);
  const footagesWithUrls = poi.footages.map(async footage => {
    const footageUrl = await Images.getPublicUrl(
      id,
      footage.imageId,
      true,
      true
    );
    return {
      footageId: footage.imageId,
      footageUrl
    };
  });
  poi.footages = Promise.all(footagesWithUrls);
  return poi;
};

module.exports = {
  getPoiById: getPoiById,
  getAllPois: getAllPois,
  getPoiWithImageUrls: getPoiWithImageUrls,
  getPoiWithFootageUrls: getPoiWithFootageUrls
};
