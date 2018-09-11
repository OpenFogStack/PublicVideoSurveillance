"use strict";

const axios = require("axios");
const credentials = require("../credentials");
const { successResponse, throwError } = require("../../lib");

class AuthorizationManagement {
  /**
   * get an access token to use the authorization management methods
   * @returns {Promise}
   */
  async retrieveAccessToken() {
    return axios
      .post(
        `https://${credentials.auth0.userManagement.domain}/oauth/token`,
        {
          client_id: credentials.auth0.authorizationManagement.clientId,
          client_secret: process.env.AUTH0_USER_API_SECRET,
          audience: credentials.auth0.authorizationManagement.audience,
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
   * get all roles
   * @param accessToken
   * @returns {Promise<void>}
   */
  async getRoles(accessToken) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/roles`,
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
   * get a specific role by Id
   * @param accessToken
   * @param roleId
   * @returns {Promise<void>}
   */
  async retrieveRole(accessToken, roleId) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/roles/${roleId}`,
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
   * create a new role
   * @param accessToken
   * @param roleName
   * @param permissions
   * @returns {Promise<void>}
   */
  async createRole(accessToken, roleName, permissions) {
    return axios
      .post(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/roles`,
        {
          name: roleName,
          description: roleName,
          permissions: permissions,
          applicationId: credentials.auth0.userManagement.clientId,
          applicationType: "client"
        },
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
   * update an existing role
   * @param accessToken
   * @param roleId
   * @param roleName
   * @param permissions
   * @returns {Promise<void>}
   */
  async updateRole(accessToken, roleId, roleName, permissions) {
    return axios
      .put(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/roles/${roleId}`,
        {
          name: roleName,
          description: roleName,
          permissions: permissions,
          applicationId: credentials.auth0.userManagement.clientId,
          applicationType: "client"
        },
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
   * delete a role
   * @param accessToken
   * @param roleId
   * @returns {Promise<void>}
   */
  async deleteRole(accessToken, roleId) {
    return axios
      .delete(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/roles/${roleId}`,
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
   * get all permissions
   * @param accessToken
   * @returns {Promise<void>}
   */
  async getPermissions(accessToken) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/permissions`,
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
   * get a specific permission by Id
   * @param accessToken
   * @param permissionId
   * @returns {Promise<void>}
   */
  async getPermission(accessToken, permissionId) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/permissions/${permissionId}`,
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
   * create a new permission
   * @param accessToken
   * @param permissionName
   * @returns {Promise<void>}
   */
  async createPermission(accessToken, permissionName) {
    return axios
      .post(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/permissions`,
        {
          name: permissionName,
          description: permissionName,
          applicationId: credentials.auth0.userManagement.clientId,
          applicationType: "client"
        },
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
   * update a permission
   * @param accessToken
   * @param permissionId
   * @param permissionName
   * @returns {Promise<void>}
   */
  async updatePermission(accessToken, permissionId, permissionName) {
    return axios
      .put(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/permissions/${permissionId}`,
        {
          name: permissionName,
          description: permissionName,
          applicationId: credentials.auth0.userManagement.clientId,
          applicationType: "client"
        },
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
   * delete a permission
   * @param accessToken
   * @param permissionId
   * @returns {Promise<void>}
   */
  async deletePermission(accessToken, permissionId) {
    return axios
      .delete(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/permissions/${permissionId}`,
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
   * get all users
   * @param accessToken
   * @returns {Promise<void>}
   */
  async getAllUsers(accessToken) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/users`,
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
   * get a specific user and its roles/permissions by Id
   * @param accessToken
   * @param userId
   * @returns {Promise<void>}
   */
  async getUser(accessToken, userId) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/users/${userId}`,
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
   * get the assigned roles of a user
   * @param accessToken
   * @param userId
   * @returns {Promise<void>}
   */
  async getUserRoles(accessToken, userId) {
    return axios
      .get(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/users/${userId}/roles`,
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
   * assign a role to a user
   * @param accessToken
   * @param userId
   * @param roleId
   * @returns {Promise<void>}
   */
  async assignRoleToUser(accessToken, userId, roleId) {
    return axios
      .patch(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/users/${userId}/roles`,
        [roleId],
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
   * remove a role from a user
   * @param accessToken
   * @param userId
   * @param roleId
   * @returns {Promise<void>}
   */
  async removeRoleFromUser(accessToken, userId, roleId) {
    return axios
      .delete(
        `https://${credentials.auth0.authorizationManagement.domain}/${
          credentials.auth0.authorizationManagement.extensionUrl
        }/users/${userId}/roles`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          data: [roleId]
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
}

module.exports = AuthorizationManagement;
