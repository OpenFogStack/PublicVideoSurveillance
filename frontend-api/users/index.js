"use strict";

const { callWithError } = require("../../lib/index");
const userManagement = require("../../auth0/userManagement/userManagement");
const AuthorizationManagement = require("../../auth0/userManagement/authorizationManagement");
const User = new userManagement();
const Authorization = new AuthorizationManagement();

module.exports = {
  async getAll() {
    let response = await User.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, User.getUsers, accessToken);
  },
  async create(data) {
    let response = await User.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(409, User.createUser, accessToken, data);
  },
  async getById(id) {
    let response = await User.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, User.retrieveUser, accessToken, id);
  },
  async updateById(id, data) {
    let response = await User.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, User.updateUser, accessToken, id, data);
  },
  async deleteById(id) {
    let response = await User.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, User.deleteUser, accessToken, id);
  },
  async getRolesOfUser(id) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, Authorization.getUserRoles, accessToken, id);
  },
  async assignRoleToUser(id, roleId) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(
      404,
      Authorization.assignRoleToUser,
      accessToken,
      id,
      roleId
    );
  },
  async removeRoleFromUser(id, roleId) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(
      404,
      Authorization.removeRoleFromUser,
      accessToken,
      id,
      roleId
    );
  }
};
