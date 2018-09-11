"use strict";
const dynamoDb = require("../../lib/dynamodb");
const uuidv1 = require("uuid/v1");
const { hash } = require("./hash");

const createUserActionLogEntry = async ({
  UserId,
  Action,
  ResourceId,
  ResourceType,
  AdditionalInfoObject
}) => {

  console.log(" " + UserId + Action + ResourceId + ResourceType + AdditionalInfoObject + Token); // debug

  console.log("test3");
  //Add log entry into DynamoDB
  const newlogentry = await generateNewLogEntry({
    UserId,
    Action,
    ResourceId,
    ResourceType,
    AdditionalInfoObject: AdditionalInfoObject
  })

  console.log("test4");

  console.log(newlogentry);

  return dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE_LOG,
      Item: newlogentry
      //ConditionExpression: "attribute_not_exists(Id)"
    })
    .promise();
};

const generateNewLogEntry = async ({
  UserId,
  Action,
  ResourceId,
  ResourceType,
  AdditionalInfoObject,
  UserInformation
}) => {
  const id = uuidv1();
  try {
    const hashvalue = await hash(id, process.env.DYNAMODB_TABLE_LOG);

    const timestamp = new Date().getTime();
    return {
      Id: id,
      UserId: UserId,
      Action: Action,
      ResourceId: ResourceId,
      ResourceType: ResourceType,
      AdditionalInfoObject: AdditionalInfoObject,
      Hash: hashvalue.hash,
      Link: hashvalue.id,
      Timestamp: timestamp
    };
  } catch (err) {
    console.log(err);
  }

};

module.exports.createUserActionLogEntry = createUserActionLogEntry;
