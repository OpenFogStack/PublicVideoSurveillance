"use strict";

const { callWithError } = require("../../lib/index");
const AuthorizationManagement = require("../../auth0/userManagement/authorizationManagement");
const Authorization = new AuthorizationManagement();

module.exports = {
  async getAll() {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, Authorization.getRoles, accessToken);
  },
  async create(roleName, permissions) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(
      404,
      Authorization.createRole,
      accessToken,
      roleName,
      permissions
    );
  },
  async getById(id) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, Authorization.retrieveRole, accessToken, id);
  },
  async updateById(id, roleName, permissions) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(
      404,
      Authorization.updateRole,
      accessToken,
      id,
      roleName,
      permissions
    );
  },
  async deleteById(id) {
    let response = await Authorization.retrieveAccessToken();
    let accessToken = response.body.result.access_token;
    return callWithError(404, Authorization.deleteRole, accessToken, id);
  }
};
