"use strict";
const dynamoDb = require("../lib/dynamodb");
const AWS = require("aws-sdk");
const iot = new AWS.Iot({apiVersion: '2015-05-28', region: "eu-central-1"});
const {
  LOG_ACTIONS,
  AWS_RESOURCE,
  RESOURCE_TYPES
} = require("../constants");
const {
  createUserActionLogEntry
} = require("../secure-log-api/log-manager");

const deleteCertificates = async (userId, edgeId) => {
  const edgeInfo = await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      Key: {
        id: edgeId
      }
    })
    .promise().then(item => {
      if (item && item.Item && item.Item.id) {
        return item.Item;
      }
      return {};
    });

  if ( Object.keys(edgeInfo).length > 0 && edgeInfo.awsiotInformation.certificatePem != "deleted"){
    await dynamoDb
      .update({
        ExpressionAttributeValues: {
         ":cp": "deleted",
         ":prk": "deleted",
         ":puk": "deleted"
        },
        Key: {
         "id": edgeId
        },
        ReturnValues: "UPDATED_NEW",
        TableName: process.env.DYNAMODB_TABLE_EDGES,
        UpdateExpression: "SET awsiotInformation.certificatePem = :cp, awsiotInformation.PrivateKey = :prk, awsiotInformation.PublicKey = :puk"
      })
      .promise();

    await createUserActionLogEntry({
      UserId: userId,
      Action: LOG_ACTIONS.EDGE_CERTIFICATES_DOWNLOADED,
      ResourceId: edgeId,
      ResourceType: RESOURCE_TYPES.EDGE
    });
  }
  return {};
}

const deleteEdgeById = async id => {

  //get information about the edge
  const edgeInfo = await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      Key: {
        id: id
      }
    })
    .promise().then(item => {
      if (item && item.Item && item.Item.id) {
        return item.Item;
      }
      return throwError("No Item found", 404);
    });

  //AWS IOT: Deactivate, detach, and delete certificate & thing
  await iot.updateCertificate({
          certificateId: edgeInfo.awsiotInformation.certificateId,
          newStatus: "INACTIVE"
        }).promise();
  await iot.detachThingPrincipal({
          principal: edgeInfo.awsiotInformation.certificateArn,
          thingName: edgeInfo.awsiotInformation.thingName
        }).promise();
  await iot.removeThingFromThingGroup({
          thingArn: edgeInfo.awsiotInformation.thingArn,
          thingGroupArn: AWS_RESOURCE.THING_GROUPARN,
          thingGroupName: AWS_RESOURCE.THING_GROUPNAME,
          thingName: edgeInfo.awsiotInformation.thingName
        }).promise();
  await iot.deleteCertificate({
          certificateId: edgeInfo.awsiotInformation.certificateId,
          forceDelete: true
        }).promise();
  await iot.deleteThing({
          thingName: edgeInfo.awsiotInformation.thingName
        }).promise();

  return dynamoDb
    .delete({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      Key: {
        id
      },
      ConditionExpression: "attribute_exists(id)"
    })
    .promise()
    .then(res => {});
};

module.exports = {
  deleteEdgeById: deleteEdgeById,
  deleteCertificates: deleteCertificates
};
