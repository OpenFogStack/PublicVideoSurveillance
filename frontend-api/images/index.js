"use strict";
const { callWithError } = require("../../lib");

const { deleteImage, deleteImageFolder } = require("./delete");
const { createImage } = require("./create");
const { approveImage } = require("./update");
const { getPublicImageUrl } = require("./get");

module.exports = {
  async delete({ poiId, imageId, isApproved = true, isFootage = false }) {
    return callWithError(404, deleteImage, {
      poiId,
      imageId,
      isApproved,
      isFootage
    });
  },
  async deleteAllOfPoi(poiId) {
    return callWithError(404, deleteImageFolder, poiId);
  },
  async create(poiId, rawImage, isFootage) {
    return callWithError(409, createImage, poiId, rawImage, isFootage);
  },
  async getPublicUrl(poiId, imageId, isFootage, isApproved) {
    return callWithError(
      404,
      getPublicImageUrl,
      poiId,
      imageId,
      isFootage,
      isApproved
    );
  },
  async approve(poiId, imageId) {
    return callWithError(404, approveImage, poiId, imageId);
  }
};
