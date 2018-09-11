"use strict";
const uuidv1 = require("uuid/v1");
const s3 = require("../../lib/s3");
const { imageKeyBuilder } = require("../../lib");

const deleteImage = async ({ poiId, imageId, isApproved, isFootage }) => {
  const KEY = imageKeyBuilder({ poiId, imageId, isApproved, isFootage });
  return deleteObject(KEY);
};

const deleteObject = async Key => {
  const KEY = Key;
  return s3
    .deleteObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY
    })
    .promise()
    .then(res => {});
};

const deleteDir = async Key => {
  await emptyS3Directory(process.env.POI_IMAGES_BUCKET, Key);
  const KEY = `${Key}/`;
  return s3
    .deleteObject({
      Bucket: process.env.POI_IMAGES_BUCKET,
      Key: KEY
    })
    .promise()
    .then(res => {});
};

async function emptyS3Directory(bucket, dir) {
  const listParams = {
    Bucket: bucket,
    Prefix: dir
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.Contents.IsTruncated) await emptyS3Directory(bucket, dir);
}

const deleteImageFolder = folderName => {
  return deleteDir(folderName);
};

module.exports = {
  deleteImage: deleteImage,
  deleteImageFolder: deleteImageFolder
};
