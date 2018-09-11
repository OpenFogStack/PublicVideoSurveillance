"use strict";

const User = require("../../../frontend-api/users");
const Role = require("../../../frontend-api/roles");

const dynamoDb = require("../../../lib/dynamodb");

const {
  createUserActionLogEntry
} = require("../../../secure-log-api/log-manager");

const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../../../constants");

const { errorResponse, getUserIdOfJWT } = require("../../../lib");
const { deleteApprovalItem } = require("../../data/delete");

const processData = async (id, action, parameters, jwt, resourceId) => {
  switch (action) {
    case APPROVAL_ACTIONS.USER_NEW:
      return createUser(id, parameters, jwt);
    case APPROVAL_ACTIONS.USER_UPDATE:
      return updateUser(id, resourceId, parameters, jwt);
    case APPROVAL_ACTIONS.USER_DELETE:
      return deleteUser(id, resourceId, jwt);
    case APPROVAL_ACTIONS.USER_ADD_ROLE:
      return assignRoleToUser(id, resourceId, parameters.roleId, jwt);
    case APPROVAL_ACTIONS.USER_REMOVE_ROLE:
      return removeRoleFromUser(id, resourceId, parameters.roleId, jwt);
    case APPROVAL_ACTIONS.ROLE_NEW:
      return createRole(id, parameters, jwt);
    case APPROVAL_ACTIONS.ROLE_UPDATE:
      return updateRole(id, resourceId, parameters, jwt);
    case APPROVAL_ACTIONS.ROLE_DELETE:
      return deleteRole(id, resourceId, jwt);
    default:
      throw Error(`ApprovalAction ${action} not handled`);
  }
};

const createUser = async (id, parameters, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await User.create(parameters.data);
    if (res.statusCode !== 201) {
      // creating the user failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_CREATE,
      ResourceId: res.body.result.user_id,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        res
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const updateUser = async (id, auth0UserId, parameters, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await User.updateById(auth0UserId, parameters.data);
    if (res.statusCode !== 200) {
      // updating the user failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_UPDATE,
      ResourceId: auth0UserId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        user: res.body.result
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const deleteUser = async (id, auth0UserId, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await User.deleteById(auth0UserId);
    if (res.statusCode !== 204) {
      // deleting the user failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_DELETE,
      ResourceId: auth0UserId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        userId: auth0UserId
      }
    });
    await deleteApprovalItem(id);
    //delete all approvalitems of/about that user as well
    const items = (await dynamoDb
      .scan({
        TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
        FilterExpression: "resourceId = :userId OR userId = :userId",
        ExpressionAttributeValues: { ":userId": auth0UserId }
      })
      .promise()).Items;

    console.log("deleting unnecessary items for userid " + auth0UserId);
    console.log(items);

    await Promise.all(
      items.map(async item => {
        const id = item.id;
        return await dynamoDb
          .delete({
            TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
            Key: { id },
            ConditionExpression: "attribute_exists(id)"
          })
          .promise();
      })
    );
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const assignRoleToUser = async (id, auth0UserId, roleId, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await User.assignRoleToUser(auth0UserId, roleId);
    if (res.statusCode !== 204) {
      // assigning a role to the user failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_ROLE_ADD,
      ResourceId: auth0UserId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        user: res.body.result
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const removeRoleFromUser = async (id, auth0UserId, roleId, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await User.removeRoleFromUser(auth0UserId, roleId);
    if (res.statusCode !== 204) {
      // removing a role from the user failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.USER_ROLE_REMOVE,
      ResourceId: auth0UserId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        user: res.body.result
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const createRole = async (id, parameters, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await Role.create(parameters.name, parameters.permissions);
    if (res.statusCode !== 200) {
      // creating a role failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.ROLE_CREATE,
      ResourceId: role.body.result._id,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        role: res.body.result
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const updateRole = async (id, roleId, parameters, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await Role.updateById(
      roleId,
      parameters.name,
      parameters.permissions
    );
    if (res.statusCode !== 200) {
      // updating a role failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.ROLE_UPDATE,
      ResourceId: roleId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        role: res.body.result
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const deleteRole = async (id, roleId, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const res = await Role.deleteById(roleId);
    if (res.statusCode !== 204) {
      // deleting a role failed, res is already an error response
      return res;
    }
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.ROLE_DELETE,
      ResourceId: roleId,
      ResourceType: RESOURCE_TYPES.USER,
      AdditionalInfoObject: {
        roleId: roleId
      }
    });
    await deleteApprovalItem(id);
    return res;
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

module.exports = {
  processData: processData
};
