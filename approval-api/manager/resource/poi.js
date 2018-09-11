"use strict";
const Poi = require("../../../frontend-api/pois");
const dynamoDb = require("../../../lib/dynamodb");
const {
  successResponse,
  errorResponse,
  getUserIdOfJWT
} = require("../../../lib");

const {
  createUserActionLogEntry
} = require("../../../secure-log-api/log-manager");

const {
  APPROVAL_ACTIONS,
  LOG_ACTIONS,
  RESOURCE_TYPES
} = require("../../../constants");

const { deleteApprovalItem } = require("../../data/delete");

const processData = async (id, action, parameters, jwt, resourceId) => {
  switch (action) {
    case APPROVAL_ACTIONS.POI_NEW:
      return createPOI(id, parameters, jwt);
    case APPROVAL_ACTIONS.POI_DELETE:
      return deletePOI(id, resourceId, jwt);
    case APPROVAL_ACTIONS.POI_IMAGE_ADD:
      return addImageToPOI(
        id,
        resourceId,
        jwt,
        parameters.imageId,
        parameters.isFootage
      );
    case APPROVAL_ACTIONS.POI_IMAGE_DELETE:
      return deleteImageFromPOI(id, resourceId, jwt, parameters.imageId);
    case APPROVAL_ACTIONS.POI_FOOTAGE_DELETE:
      return deleteFootageFromPOI(id, resourceId, jwt, parameters.imageId);
    case APPROVAL_ACTIONS.POI_USER_ADD:
      return addUserToPOI(id, resourceId, jwt, parameters.userId);
    case APPROVAL_ACTIONS.POI_USER_DELETE:
      return deleteUserFromPOI(id, resourceId, jwt, parameters.userId);
    default:
      throw Error(`ApprovalAction ${action} not handled`);
  }
};

const deleteFootageFromPOI = async (id, poiId, jwt, imageId) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    await Poi.deleteFootage(poiId, imageId);
    await createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.POI_FOOTAGE_DELETE,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poiId: poiId,
        imageId: imageId
      }
    });
    await deleteApprovalItem(id);
    return successResponse({ message: "Footage deleted" });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const addImageToPOI = async (id, poiId, jwt, imageId, isFootage) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    console.log(
      `ApprovalManager/POI: addImageToPoi(id:${id}, poiId:${poiId}, jwt, imageId${imageId},isFootage: ${isFootage})`
    );
    await Poi.addImage(poiId, imageId, isFootage);
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.POI_IMAGE_ADD,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poiId: poiId,
        imageId: imageId,
        isFootage
      }
    });
    await deleteApprovalItem(id);
    return successResponse({ imageId: imageId });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const deleteImageFromPOI = async (id, poiId, jwt, imageId) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    await Poi.deleteImage(poiId, imageId);
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.POI_IMAGE_DELETE,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poiId: poiId,
        imageId: imageId
      }
    });
    await deleteApprovalItem(id);

    return successResponse({});
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const addUserToPOI = async (id, poiId, jwt, userId) => {
  const requestUserId = getUserIdOfJWT(jwt);

  try {
    await Poi.addUser(poiId, userId, jwt);
    createUserActionLogEntry({
      UserId: requestUserId,
      Action: LOG_ACTIONS.POI_USER_ADD,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poiId: poiId,
        userId: userId
      }
    });
    await deleteApprovalItem(id);
    return successResponse({ imageId: imageId });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const deleteUserFromPOI = async (id, poiId, jwt, userId) => {
  const requestUserId = getUserIdOfJWT(jwt);

  try {
    await Poi.deleteUser(poiId, userId);
    createUserActionLogEntry({
      UserId: requestUserId,
      Action: LOG_ACTIONS.POI_USER_DELETE,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poiId: poiId,
        userId: userId
      }
    });
    await deleteApprovalItem(id);
    return successResponse({});
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

const deletePOI = async (id, poiId, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const poi = await Poi.deleteById(poiId);
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.POI_DELETE,
      ResourceId: poiId,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poi: poiId
      }
    });

    console.log("deleting item..." + id);

    await deleteApprovalItem(id);
    //delete all approvalitems about that poi as well
    console.log("getting all other items...");

    const items = (await dynamoDb
      .scan({
        TableName: process.env.DYNAMODB_TABLE_ITEMS_TO_APPROVE,
        FilterExpression: "resourceId = :poiId",
        ExpressionAttributeValues: { ":poiId": poiId }
      })
      .promise()).Items;

    console.log("deleting unnecessary items for poiid " + poiId);
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

    console.log("everything deleted");

    return successResponse({ poi });
  } catch (error) {
    console.log("ERROR");
    console.log(error);
    return errorResponse(error.message, error.statusCode);
  }
};

const createPOI = async (id, parameters, jwt) => {
  const userId = getUserIdOfJWT(jwt);

  try {
    const poi = await Poi.create(
      userId,
      parameters.id,
      parameters.firstName,
      parameters.lastName,
      parameters.reason,
      parameters.description
    );
    createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.POI_CREATE,
      ResourceId: poi.id,
      ResourceType: RESOURCE_TYPES.POI,
      AdditionalInfoObject: {
        poi
      }
    });
    await deleteApprovalItem(id);
    return successResponse({ poi });
  } catch (error) {
    return errorResponse(error.message, error.statusCode);
  }
};

module.exports = {
  processData: processData
};
