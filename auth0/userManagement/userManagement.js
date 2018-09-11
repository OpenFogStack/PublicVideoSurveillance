"use strict";

const axios = require("axios");
const credentials = require("../credentials");
const { successResponse, throwError } = require("../../lib");

class UserManagement {
  /**
   * get an access token to use the user managements methods
   * @returns {string}
   */
  async retrieveAccessToken() {
    return axios
      .post(
        `https://${credentials.auth0.userManagement.domain}/oauth/token`,
        {
          client_id: credentials.auth0.authorizationManagement.clientId,
          client_secret: process.env.AUTH0_USER_API_SECRET,
          audience: credentials.auth0.userManagement.audience,
          grant_type: "client_credentials"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }

  /**
   * create a user
   * data is an object like
   * {
   *  "connection": "Username-Password-Authentication",
   *  "email": "john.doe@gmail.com",
   *  "password": "secretpa!ssword999",
   *  "user_id": "", (optional)
   *  "username": "johndoe", (optional)
   *  "phone_number": "+199999999999999", (optional)
   *  "user_metadata": {}, (optional)
   *  "email_verified": false, (optional)
   *  "verify_email": false, (optional)
   *  "phone_verified": false, (optional)
   *  "app_metadata": {} (optional)
   * }
   * @param accessToken
   * @param data
   * @returns {Promise<void>}
   */
  async createUser(accessToken, data) {
    return axios
      .post(
        `https://${credentials.auth0.userManagement.domain}/api/v2/users`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }

  /**
   * retrieve a user
   * @param accessToken
   * @param userId
   * @returns {Promise<void>}
   */
  async retrieveUser(accessToken, userId) {
    return axios
      .get(
        `https://${
          credentials.auth0.userManagement.domain
        }/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }

  /**
   * update a user
   * @param accessToken
   * @param userId
   * @param data
   * @returns {Promise<void>}
   */
  async updateUser(accessToken, userId, data) {
    return axios
      .patch(
        `https://${
          credentials.auth0.userManagement.domain
        }/api/v2/users/${userId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }

  /**
   * delete a user by id
   * @param accessToken
   * @param userId
   * @returns {Promise<void>}
   */
  async deleteUser(accessToken, userId) {
    return axios
      .delete(
        `https://${
          credentials.auth0.userManagement.domain
        }/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }

  /**
   * get all users
   * @param accessToken
   * @returns {Promise<void>}
   */
  async getUsers(accessToken) {
    return axios
      .get(`https://${credentials.auth0.userManagement.domain}/api/v2/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        return successResponse(response.data, response.status);
      })
      .catch(err => {
        return throwError(
          err.response.data.message,
          err.response.data.statusCode
        );
      });
  }
}

module.exports = UserManagement;
