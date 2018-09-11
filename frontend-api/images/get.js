"use strict";
const s3 = require("../../lib/s3");
const { imageKeyBuilder } = require("../../lib");

const getPublicImageUrl = async (poiId, imageId, isFootage, isApproved) => {
  const KEY = imageKeyBuilder({
    poiId,
    imageId,
    isFootage,
    isApproved
  });
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.POI_IMAGES_BUCKET,
    Key: KEY
  });
};

module.exports = {
  getPublicImageUrl: getPublicImageUrl
};
