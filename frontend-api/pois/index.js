"use strict";
const {
  throwError,
  getUserAuthOfJWT,
  getUserIdOfJWT,
  isSupervisor
} = require("../../lib");
const { getUser } = require("../../lib/userHelper");
const {
  getPoi,
  getAll,
  getWithImageUrls,
  getWithFootageUrls,
  create,
  addImage,
  addUser,
  deletePoi,
  deleteImage,
  deleteFootage,
  deleteUser
} = require("./data");

// checks if the user (by jwt) is allowed to see the poi (returns boolean)
const isUserAllowedToSeePoi = (jwt, poi) => {
  const userAuth = getUserAuthOfJWT(jwt);
  const userId = getUserIdOfJWT(jwt);
  if (isSupervisor(userAuth.roles) || poi.users.indexOf(userId) >= 0) {
    return true;
  }
  return false;
};

// strips out fields that should not be visible for the user
const processPoi = (jwt, poi) => {
  const userAuth = getUserAuthOfJWT(jwt);
  if (!isSupervisor(userAuth.roles)) {
    delete poi.users;
  }
  return poi;
};

module.exports = {
  async getById(id, jwt) {
    const poi = await getPoi(id);
    if (isUserAllowedToSeePoi(jwt, poi)) {
      return processPoi(jwt, poi);
    }
    throwError("User does not have access to poi", 403);
  },
  async getAllImages(id, jwt) {
    const poi = await getWithImageUrls(id);
    if (isUserAllowedToSeePoi(jwt, poi)) {
      return processPoi(jwt, poi).images;
    }
    throwError("User does not have access to poi", 403);
  },
  async getAllFootages(id, jwt) {
    const poi = await getWithFootageUrls(id);
    if (isUserAllowedToSeePoi(jwt, poi)) {
      return processPoi(jwt, poi).footages;
    }
    throwError("User does not have access to poi", 403);
  },
  async getAllUsers(id, jwt) {
    let poi = await getPoi(id);
    if (
      isSupervisor(getUserAuthOfJWT(jwt).roles) &&
      isUserAllowedToSeePoi(jwt, poi)
    ) {
      const users = poi.users.map(async userId => {
        const userData = await getUser(userId);
        return Object.assign({}, userData, { userId });
      });
      return Promise.all(users);
    } else {
      throwError("User does not have access to users of poi", 403);
    }
  },
  async getAll(jwt) {
    let pois = await getAll();
    return pois
      .filter(poi => isUserAllowedToSeePoi(jwt, poi))
      .map(poi => processPoi(jwt, poi));
  },
  async create(userId, id, firstName, lastName, reason, description, jwt) {
    return create(userId, id, firstName, lastName, reason, description);
  },
  async addImage(id, imageId, isFootage, jwt) {
    return addImage(id, imageId, isFootage);
  },
  async addUser(id, userId, jwt) {
    return addUser(id, userId);
  },
  async deleteById(id, jwt) {
    return deletePoi(id);
  },
  async deleteImage(id, imageId, jwt) {
    return deleteImage(id, imageId);
  },
  async deleteFootage(id, imageId, jwt) {
    return deleteFootage(id, imageId);
  },
  async deleteUser(id, userId, jwt) {
    return deleteUser(id, userId);
  }
};
