"use strict";
const dynamoDb = require("../../lib/dynamodb");
const sha512 = require("js-sha512");

const hash = async (id, logtable) => {
  try {
    const response = await dynamoDb
      .put({
        TableName: process.env.DYNAMODB_TABLE_LOG_HELPER,
        Item: { table: logtable, latest: id },
        ReturnValues: "ALL_OLD",
        ReturnItemCollectionMetrics: "SIZE"
      })
      .promise();

    console.log(response);

    console.log("test5");

    if (response.hasOwnProperty("Attributes")) {
      console.log("test7");

      const item = await dynamoDb
        .get({
          TableName: logtable,
          Key: { Id: response.Attributes.latest }
        })
        .promise();
      console.log(item);

      return {
        id: response.Attributes.latest,
        hash: sha512(JSON.stringify(item.Item))
      };
    } else {
      return {
        hash: "NULL",
        id: "NULL"
      };
    }
  } catch (err) {
    console.log(err);
  }

  return {
    hash: "NULL",
    id: id
  };
};

module.exports = {
  hash: hash
};
