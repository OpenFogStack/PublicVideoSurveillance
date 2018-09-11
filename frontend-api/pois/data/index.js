"use strict";

const { callWithError } = require("../../../lib");
const {
  getAllPois,
  getPoiById,
  getPoiWithImageUrls,
  getPoiWithFootageUrls
} = require("./read");
const {
  deletePoiById,
  deleteImageByPoiIdAndKey,
  deleteFootageByPoiIdAndKey,
  deleteUserByPoiIdAndUserId
} = require("./delete");

const { createPoi } = require("./create");
const { addImageToPoi, addUserToPoi } = require("./update");

module.exports = {
  async getPoi(id) {
    return callWithError(404, getPoiById, id);
  },
  async getWithImageUrls(id) {
    return callWithError(404, getPoiWithImageUrls, id);
  },
  async getWithFootageUrls(id) {
    return callWithError(404, getPoiWithFootageUrls, id);
  },
  async getAll() {
    return callWithError(404, getAllPois);
  },
  async create(userId, id, firstName, lastName, reason, description) {
    return callWithError(
      409,
      createPoi,
      userId,
      id,
      firstName,
      lastName,
      reason,
      description
    );
  },
  async addImage(id, imageId, isFootage) {
    return callWithError(404, addImageToPoi, id, imageId, isFootage);
  },
  async addUser(id, userId) {
    return callWithError(404, addUserToPoi, id, userId);
  },
  async deletePoi(id) {
    return callWithError(404, deletePoiById, id);
  },
  async deleteImage(id, imageId) {
    return callWithError(404, deleteImageByPoiIdAndKey, id, imageId);
  },
  async deleteFootage(id, imageId) {
    return callWithError(404, deleteFootageByPoiIdAndKey, id, imageId);
  },
  async deleteUser(id, userId) {
    return callWithError(404, deleteUserByPoiIdAndUserId, id, userId);
  }
};
