<template>
  <div class="admin">
    <b-modal
      :active.sync="isCreateEdgeModalActive"
      has-modal-card>
      <create-edge-modal />
    </b-modal>
    <b-modal
      :active.sync="isEdgeDetailsModalActive"
      has-modal-card>
      <edge-details-modal :edge-id="selectedEdge"/>
    </b-modal>
    <header-component />
    <div class="container">
      <div class="columns">
        <div class="column is-12">
          <breadcrumbs :entries="breadcrumbs" />
          <div class="columns">
            <div class="column is-12">
              <div class="card events-card">

                <header class="card-header">
                  <p class="card-header-title">
                    <a
                      aria-label="Create Edge"
                      @click="openCreateEdgeModal">
                      <b-icon
                        icon="plus"
                      />
                    </a>
                  </p>
                  <a
                    class="card-header-icon"
                    aria-label="more options"
                    @click="getEdges">
                    <span class="icon">
                      <i
                        class="mdi mdi-sync mdi-24px"
                        aria-hidden="true"/>
                    </span>
                  </a>
                </header>
                <div class="card-table">
                  <div class="content">
                    <b-table
                      :data="edges"
                      :loading="isLoading"
                      :default-sort-direction="'desc'">
                      <template slot-scope="props">
                        <b-table-column
                          field="id"
                          label="Id">
                          {{ props.row.id }}
                        </b-table-column>
                        <b-table-column
                          field="description"
                          label="Description">
                          {{ props.row.description }}
                        </b-table-column>
                        <b-table-column field="details">
                          <a
                            class="button right"
                            @click="openDeleteEdgeDialog(props.row)">
                            <b-icon
                              icon="delete"
                              type="is-danger" />
                          </a>
                          <a
                            v-if="props.row.readAccess === 'X'"
                            class="button right"
                            @click="openEdgeDetailsDialog(props.row)">
                            <b-icon
                              icon="information-outline" />
                          </a>
                        </b-table-column>
                      </template>
                      <template slot="empty">
                        <section class="section">
                          <div class="content has-text-grey has-text-centered">
                            <p>
                              <b-icon
                                icon="emoticon-sad"
                                size="is-large"/>
                            </p>
                            <p>Nothing here.</p>
                          </div>
                        </section>
                      </template>
                    </b-table>
                  </div>
                </div>
                <footer class="card-footer"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "~/components/Header";
import Breadcrumbs from "~/components/Breadcrumbs";
import CreateEdgeModal from "~/components/CreateEdgeModal";
import EdgeDetailsModal from "~/components/EdgeDetailsModal";

export default {
  components: {
    headerComponent: Header,
    Breadcrumbs,
    CreateEdgeModal,
    EdgeDetailsModal
  },
  data() {
    return {
      isLoading: false,
      edges: [],
      isCreateEdgeModalActive: false,
      isEdgeDetailsModalActive: false,
      selectedEdge: "",
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          name: "Edges"
        }
      ]
    };
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.getEdges();
  },
  middleware: "isSupervisor",
  methods: {
    openDeleteEdgeDialog(edge) {
      this.$dialog.confirm({
        message: `Are you sure you want to delete <em>${
          edge.id
        }</em>? This cannot be undone`,
        onConfirm: () => this.deleteEdge(edge),
        confirmText: "Delete Edge",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deleteEdge(edge) {
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Deleting Edge...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        await this.$axios.delete(`api/edge/${edge.id}`);
        this.$toast.open({
          duration: 1000,
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully deleted Edge. Waiting for approval...`,
          position: "is-bottom",
          type: "is-success"
        });
      } catch (err) {
        this.$toast.open({
          duration: 1000,
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          } </div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    async getEdges() {
      this.isLoading = true;
      const edges = await this.$axios.get("api/edge");
      this.edges = edges.data.result.edges;
      this.isLoading = false;
    },
    openCreateEdgeModal() {
      this.isCreateEdgeModalActive = true;
    },
    openEdgeDetails(edge) {
      this.isEdgeDetailsModalActive = true;
      this.selectedEdge = edge.id;
    },
    openEdgeDetailsDialog(edge) {
      console.log(edge);
      this.$dialog.confirm({
        title: `Attention`,
        message: `Edge credentials can only be viewed once. Make sure to save them.`,
        onConfirm: () => this.openEdgeDetails(edge),
        confirmText: "Continue",
        type: "is-success"
      });
    }
  }
};
</script>

<style>
div.admin {
  font-family: "Open Sans", sans-serif;
}

.right {
  float: right;
}
</style>
