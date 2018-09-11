"use strict";
const AWS = require("aws-sdk");

const lambda = new AWS.Lambda({
  region: process.env.REGION
});

const getUser = async userId => {
  const Payload = { userId };
  const userResponse = await lambda
    .invoke({
      FunctionName: `${process.env.LAMBDA_PREFIX}-cachedInternalUserHandler`,
      Payload: JSON.stringify(Payload)
    })
    .promise();

  const user = JSON.parse(userResponse.Payload);

  const { nickname, name, email } = user;
  let city = "";
  try {
    city = user.user_metadata.geoip.city_name;
  } catch (error) {}
  return { nickname, name, email, city, userId };
};

module.exports = {
  getUser: getUser
};
