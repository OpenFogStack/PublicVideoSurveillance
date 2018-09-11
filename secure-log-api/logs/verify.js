"use strict";
const dynamoDb = require("../../lib/dynamodb");
const sha512 = require("js-sha512");

const verifyUserActionLogHash = async hash => {
  const lastentry = (await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_LOG_HELPER,
      Key: { table: process.env.DYNAMODB_TABLE_LOG }
    })
    .promise()).Attributes.latest;
  return verifyHashForId(
    hash,
    process.env.DYNAMODB_TABLE_LOG,
    process.env.DYNAMODB_TABLE_LOG_INDEX_HASH_CHAIN
  );
};

const verifySystemActionLogHash = async hash => {
  const lastentry = (await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE_LOG_HELPER,
      Key: { table: process.env.DYNAMODB_TABLE_SYSTEM_LOG }
    })
    .promise()).Attributes.latest;
  return verifyHashForId(
    hash,
    process.env.DYNAMODB_TABLE_SYSTEM_LOG,
    process.env.DYNAMODB_TABLE_SYSTEM_LOG_INDEX_HASH_CHAIN
  );
};

const verifyHashForId = async (hash, id, table, index) => {
  const item = (await dynamoDb
    .query({
      TableName: table,
      IndexName: index,
      KeyConditionExpression: "Hash = :hash",
      ExpressionAttributeValues: {
        ":hash": hash
      }
    })
    .promise()).Items[0];

  if (item.Link == id) {
    return hash == "NULL";
  } else {
    const currentHash = async (hash, id, table) => {
      const thisitem = await dynamoDb
        .get({
          TableName: logtable,
          Key: { Id: id }
        })
        .promise();
      return {
        hashcorrect: hash == sha512(JSON.stringify(thisitem.Item)),
        nextlink: thisitem.Item.link,
        nexthash: thisitem.Item.hash
      };
    };

    return (
      (await currentHash.hashcorrect) &&
      verifyHashForId(currentHash.nexthash, currentHash.nextlink, table, index)
    );
  }
};

module.exports = {
  verifyUserActionLogHash: verifyUserActionLogHash,
  verifySystemActionLogHash: verifySystemActionLogHash
};
