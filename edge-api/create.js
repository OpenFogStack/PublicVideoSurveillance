"use strict";
const dynamoDb = require("../lib/dynamodb");
const AWS = require("aws-sdk");
const iot = new AWS.Iot({apiVersion: '2015-05-28', region: "eu-central-1"});
const {
  LOG_ACTIONS,
  AWS_RESOURCE
} = require("../constants");


const createEdge = async (userId, edgeId, description) => {

  //Create new thing
  const newThing = await iot.createThing({
  thingName: edgeId,
  attributePayload: {
      attributes: {
        'EDGE_ID': edgeId,
      },
      merge: false
    },
    thingTypeName: AWS_RESOURCE.THING_TYPENAME
  }).promise();

  //Add thing to thing group
  await iot.addThingToThingGroup({
    thingArn: newThing.thingArn,
    thingGroupArn: AWS_RESOURCE.THING_GROUPARN,
    thingGroupName: AWS_RESOURCE.THING_GROUPNAME,
    thingName: newThing.thingName
  }).promise();

  //generate certificate
  const newCert = await iot.createKeysAndCertificate({
    setAsActive: true
  }).promise();

  //Attach Policy
  await iot.attachPolicy({
    policyName: AWS_RESOURCE.THING_POLICYNAME,
    target: newCert.certificateArn
  }).promise();

  //Attach policy to certificate
  await iot.attachPolicy({
    policyName: AWS_RESOURCE.THING_POLICYNAME,
    target: newCert.certificateArn
  }).promise();

  //Attach certificate to thing
  await iot.attachThingPrincipal({
    principal: newCert.certificateArn,
    thingName: newThing.thingName
  }).promise();

  //Prepare database object
  let result = {};
  result.thingName = newThing.thingName;
  result.thingArn = newThing.thingArn;
  result.thingId = newThing.thingId;
  result.iotEndpoint = AWS_RESOURCE.THING_IOT_ENDPOINT;
  result.certificateArn = newCert.certificateArn;
  result.certificateId = newCert.certificateId;
  result.certificatePem = newCert.certificatePem;
  result.PublicKey = newCert.keyPair.PublicKey;
  result.PrivateKey = newCert.keyPair.PrivateKey;

  //Store data in DynamoDB:
  const newEdge = await generateNewEdge(userId, edgeId, description, result);
  await dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE_EDGES,
      Item: newEdge,
      ConditionExpression: "attribute_not_exists(id)"
    })
    .promise();

  return { newEdge };
};

const generateNewEdge = (userId, edgeId, description, awsiotInformation) => {
  const timestamp = new Date().getTime();
  return {
    id: edgeId,
    description,
    awsiotInformation,
    createdAt: timestamp,
    createdBy: userId,
    approved: false
  };
};

module.exports = {
  createEdge: createEdge
};
