"use strict";
const dynamoDb = require("../../lib/dynamodb");
const uuidv1 = require("uuid/v1");
const { hash } = require("./hash");

const createSystemActionLogEntry = async ({
  ComponentId,
  ComponentType,
  Action,
  AdditionalInfoObject,
  Level
}) => {
  console.log("test3");
  //Add log entry into DynamoDB
  const newlogentry = await generateNewLogEntry({
    ComponentId,
    ComponentType,
    Action,
    AdditionalInfoObject,
    Level
  });

  console.log(newlogentry);

  return dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE_SYSTEM_LOG,
      Item: newlogentry
      //ConditionExpression: "attribute_not_exists(Id)"
    })
    .promise();
};

const generateNewLogEntry = async ({
  ComponentId,
  ComponentType,
  Action,
  AdditionalInfoObject,
  Level
}) => {
  const id = uuidv1();
  try {
    const hashvalue = await hash(id, process.env.DYNAMODB_TABLE_SYSTEM_LOG);

    const timestamp = new Date().getTime();
    return {
      Id: id,
      ComponentId: ComponentId,
      ComponentType: ComponentType,
      Action: Action,
      AdditionalInfoObject: AdditionalInfoObject,
      Level: Level,
      Hash: hashvalue.hash,
      Link: hashvalue.id,
      Timestamp: timestamp
    };
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createSystemActionLogEntry: createSystemActionLogEntry
};
