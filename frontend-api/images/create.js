"use strict";
const uuidv1 = require("uuid/v1");
const s3 = require("../../lib/s3");
const { imageKeyBuilder } = require("../../lib");

const createImage = async (poiId, rawImage, isFootage) => {
  const buffer = new Buffer(rawImage, "base64");
  const imageId = uuidv1();
  const KEY = imageKeyBuilder({
    poiId,
    imageId,
    isFootage,
    isApproved: false
  });
  const timestamp = new Date().getTime();
  return s3
    .putObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY,
      ContentType: "image/jpeg",
      ACL: "public-read",
      Body: buffer
    })
    .promise()
    .then(res => {
      return {
        created: timestamp,
        imageId: imageId
      };
    });
};
module.exports = {
  createImage: createImage
};
