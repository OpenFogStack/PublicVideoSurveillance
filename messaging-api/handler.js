"use strict";

const incoming = require("./incoming");
const outgoing = require("./outgoing");

module.exports = {
  incoming: incoming.incomingEdgeData,
  outgoing: outgoing.outgoingEdgeData
};
