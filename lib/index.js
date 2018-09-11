"use strict";
const Joi = require("joi");
const APP_URL = "https://watchyourfac.es";
const JWT_GEOIP_FIELD = `${APP_URL}/geoIP`;
const JWT_USER_AUTHORIZATION = `${APP_URL}/userAuthorization`;

const PREFIX_RESULTS = "results";
const PREFIX_UNAPPROVED = "approvalworkflow";

// helper function to return data in a proper way for vandium with statusCode correctly set and our own
// response structure used.
const successResponse = (data, code) => {
  const statusCode = code === 201 ? 201 : code;
  return {
    statusCode,
    body: {
      status: "OK",
      code: statusCode,
      message: "",
      result: data
    }
  };
};

// helper function to return data in a proper way for vandium with statusCode correctly set and our own
// response structure used.
const errorResponse = (message, code) => {
  return {
    statusCode: code,
    body: {
      status: "ERROR",
      code,
      message,
      result: {}
    }
  };
};

// helper function to throw an error
// thrown error can then be returned using errorResponse()
const throwError = (message, code) => {
  // 401 is only used for authentication, we use 403 instead
  code = code === 401 ? 403 : code;
  let error = new Error(message);
  error.statusCode = code;
  throw error;
};

// helper function to call an async function and return the result while also catching any errors and
// throwing the error with the specified error code
async function callWithError(errorCode, asyncFunction, ...params) {
  let returnObj;
  try {
    returnObj = await asyncFunction(...params);
  } catch (err) {
    console.log(err);
    errorCode = errorCode !== err.statusCode ? err.statusCode : errorCode;
    return throwError(err, errorCode);
  }
  return returnObj;
}

// helper function to build the s3 key from the poi and image id
const imageKeyBuilder = ({
  poiId,
  imageId,
  isFootage = false,
  isApproved = true
}) => {
  const validationErrorMessagePrefix = "imageKeyBuilder() ";
  Joi.assert(
    poiId,
    Joi.string()
      .invalid("")
      .required(),
    validationErrorMessagePrefix + "poiId"
  );
  Joi.assert(
    imageId,
    Joi.string()
      .invalid("")
      .required(),
    validationErrorMessagePrefix + "imageId"
  );
  const baseFolder = poiId;
  let path = baseFolder;
  if (isFootage) {
    path += `/${PREFIX_RESULTS}`;
  } else if (!isApproved) {
    path += `/${PREFIX_UNAPPROVED}`;
  }
  const isVideo = imageId.endsWith("-video");
  const KEY = isVideo
    ? `${path}/${imageId.replace("-video", "")}.mp4`
    : `${path}/${imageId}.jpg`;
  return KEY;
};

function getUserGeoOfJWT(jwt) {
  if (
    jwt &&
    jwt[JWT_GEOIP_FIELD] &&
    jwt[JWT_GEOIP_FIELD].country_code &&
    jwt[JWT_GEOIP_FIELD].country_code.length > 0
  ) {
    const geoInformation = jwt[JWT_GEOIP_FIELD];
    return geoInformation;
  } else {
    let error = new Error("Could not parse GeoInformation from JWT");
    throw error;
  }
}

function getUserAuthOfJWT(jwt) {
  if (
    jwt &&
    jwt[JWT_USER_AUTHORIZATION] &&
    jwt[JWT_USER_AUTHORIZATION].roles &&
    jwt[JWT_USER_AUTHORIZATION].permissions
  ) {
    const authInformation = jwt[JWT_USER_AUTHORIZATION];
    return authInformation;
  } else {
    let error = new Error("Could not parse Authinformation from JWT");
    throw error;
  }
}

function getUserIdOfJWT(jwt) {
  if (jwt && jwt.sub && jwt.sub.length > 0) {
    const userId = jwt.sub;
    return userId;
  } else {
    let error = new Error("Could not parse UserID from JWT");
    throw error;
  }
}

const getAuth0ClientPublicKey = () => {
  return process.env.AUTH0_CLIENT_PUBLIC_KEY.replace(/\\n/g, "\n");
};

const isSupervisor = roles => {
  return roles.includes("Supervisor") || roles.includes("Administrator");
};

const userHasAccess = (jwt, permisson) => {
  const authInformation = getUserAuthOfJWT(jwt);
  return authInformation["permissions"].includes(permisson);
};

module.exports = {
  successResponse: successResponse,
  errorResponse: errorResponse,
  throwError: throwError,
  callWithError: callWithError,
  imageKeyBuilder: imageKeyBuilder,
  getUserIdOfJWT: getUserIdOfJWT,
  getAuth0ClientPublicKey: getAuth0ClientPublicKey,
  getUserGeoOfJWT: getUserGeoOfJWT,
  getUserAuthOfJWT: getUserAuthOfJWT,
  isSupervisor: isSupervisor,
  userHasAccess: userHasAccess
};
