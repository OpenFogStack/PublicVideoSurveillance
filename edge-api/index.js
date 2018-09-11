"use strict";
const { callWithError } = require("../lib");
const { getEdgeById, getAllEdges } = require("./get");
const { deleteEdgeById, deleteCertificates } = require("./delete");
const { createEdge } = require("./create");

module.exports = {
  async getById(userId, edgeId) {
    return callWithError(404, getEdgeById, userId, edgeId);
  },
  async getAll(userId) {
    return callWithError(404, getAllEdges, userId);
  },
  async create(userId, edgeId, description) {
    return callWithError(409, createEdge, userId, edgeId, description);
  },
  async deleteById(id) {
    return callWithError(404, deleteEdgeById, id);
  },
  async deleteCertificates(userId, edgeId) {
    return callWithError(404, deleteCertificates, userId, edgeId);
  }
};
