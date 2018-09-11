"use strict";
const s3 = require("../../lib/s3");
const { imageKeyBuilder } = require("../../lib");

const approveImage = async (poiId, imageId) => {
  const oldKEY = imageKeyBuilder({ poiId, imageId, isApproved: false });
  const newKEY = imageKeyBuilder({ poiId, imageId, isApproved: true });

  await s3
    .copyObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      CopySource: process.env.POI_IMAGES_BUCKET + "/" + oldKEY,
      Key: newKEY
    })
    .promise();
  return s3
    .deleteObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: oldKEY
    })
    .promise()
    .then(res => {});
};
module.exports = {
  approveImage: approveImage
};
