<template>
  <div class="admin">
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
                    Requests
                  </p>
                  <a
                    class="card-header-icon"
                    aria-label="more options"
                    @click="getRequests">
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
                      :data="pendingRequests"
                      :loading="isLoading"
                      :default-sort-direction="'desc'"
                      :opened-detailed="defaultOpenedDetails"
                      default-sort="requested"
                      detailed
                      detail-key="id">
                      <template slot-scope="props">
                        <b-table-column
                          field="action"
                          label="Action"
                          sortable>
                          {{ mapRequestItemToDataItem(props.row).action }}
                        </b-table-column>
                        <b-table-column
                          field="requested"
                          label="Requested at"
                          sortable>
                          {{ props.row.createdAt | timestamp }}
                        </b-table-column>
                      </template>
                      <template
                        slot="detail"
                        slot-scope="props">
                        <article
                          class="media">
                          <figure
                            v-if="mapRequestItemToDataItem(props.row).hasImage"
                            class="media-left">
                            <p class="image is-128x128">
                              <img :src="mapRequestItemToDataItem(props.row).imageUrl">
                            </p>
                          </figure>
                          <div class="media-content">
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_NEW"
                              class="content">
                              <p>
                                You requested to create a new Facehunt for <strong>{{ props.row.parameters.firstName }}
                                  {{ props.row.parameters.lastName }}.</strong>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_DELETE"
                              class="content">
                              <p>
                                You requested to delete Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_IMAGE_ADD"
                              class="content">
                              <p>
                                You requested to add a new picture to Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_IMAGE_DELETE"
                              class="content">
                              <p>
                                You requested to delete a picture from Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_FOOTAGE_DELETE"
                              class="content">
                              <p>
                                You requested to delete footage from Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_USER_ADD"
                              class="content">
                              <p>
                                You requested to add <strong>{{ props.row.parameters.user | formatUser }}</strong> to Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.POI_USER_DELETE"
                              class="content">
                              <p>
                                You requested to delete <strong>{{ props.row.parameters.user | formatUser }}</strong> from Facehunt <router-link :to="{path: `/facehunts/${props.row.resourceId}`}"><strong>{{ props.row.resourceId }}</strong></router-link>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.USER_UPDATE"
                              class="content">
                              <p>
                                You requested to update email of {{ findUser(props.row.resourceId) }} to <strong>{{ props.row.parameters.data.email }}</strong>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.USER_ADD_ROLE"
                              class="content">
                              <p>
                                You requested to add role <strong>{{ findRole(props.row.parameters.roleId) }}</strong> to User {{ findUser(props.row.resourceId) }}
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.USER_REMOVE_ROLE"
                              class="content">
                              <p>
                                You requested to remove role <strong>{{ findRole(props.row.parameters.roleId) }}</strong> from User {{ findUser(props.row.resourceId) }}
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.USER_NEW"
                              class="content">
                              <p>
                                You requested to create a new user with Email <strong>{{ props.row.parameters.data.email }}</strong>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.USER_DELETE"
                              class="content">
                              <p>
                                You requested to delete user <strong>{{ findUser(props.row.resourceId) }}</strong>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.EDGE_NEW"
                              class="content">
                              <p>
                                You requested to add a new edge with Id <strong>{{ props.row.parameters.id }}</strong>
                              </p>
                            </div>
                            <div
                              v-if="props.row.action===APPROVAL_ACTIONS.EDGE_DELETE"
                              class="content">
                              <p>
                                You requested to delete an edge with Id <strong>{{ props.row.parameters.id }}</strong>
                              </p>
                            </div>
                          </div>
                        </article>
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
import { APPROVAL_ACTIONS } from "wyf-constants";
import Header from "~/components/Header";
import Breadcrumbs from "~/components/Breadcrumbs";

export default {
  components: {
    headerComponent: Header,
    Breadcrumbs
  },
  data() {
    return {
      isLoading: false,
      pendingRequests: [],
      defaultOpenedDetails: [1],
      isSupervisor: false,
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          name: "Requests"
        }
      ],
      APPROVAL_ACTIONS: APPROVAL_ACTIONS
    };
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.loadData();
  },
  methods: {
    mapRequestItemToDataItem(requestItem) {
      let actionData = {
        action: requestItem.action,
        hasImage: false,
        imageUrl: ""
      };
      switch (requestItem.action) {
        case APPROVAL_ACTIONS.POI_NEW:
          return {
            action: "Create Facehunt",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.POI_DELETE:
          return {
            action: "Delete Facehunt",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.POI_UPDATE:
          return {
            action: "Update Facehunt",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.POI_IMAGE_ADD:
          return {
            action: "Add Image",
            hasImage: true,
            imageUrl: requestItem.imageUrl
          };
        case APPROVAL_ACTIONS.POI_IMAGE_DELETE:
          return {
            action: "Delete Image",
            hasImage: true,
            imageUrl: requestItem.imageUrl
          };
        case APPROVAL_ACTIONS.POI_FOOTAGE_DELETE:
          return {
            action: "Delete Footage",
            hasImage: true,
            imageUrl: requestItem.imageUrl
          };
        case APPROVAL_ACTIONS.POI_USER_ADD:
          return {
            action: "Add User to Facehunt",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.POI_USER_DELETE:
          return {
            action: "Delete User from Facehunt",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.USER_UPDATE:
          return {
            action: "Update User",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.USER_ADD_ROLE:
          return {
            action: "Add Role to User",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.USER_REMOVE_ROLE:
          return {
            action: "Remove Role from User",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.USER_NEW:
          return {
            action: "Create User",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.USER_DELETE:
          return {
            action: "Delete User",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.EDGE_NEW:
          return {
            action: "Create Edge",
            hasImage: false,
            imageUrl: ""
          };
        case APPROVAL_ACTIONS.EDGE_DELETE:
          return {
            action: "Delete Edge",
            hasImage: false,
            imageUrl: ""
          };
      }
      return actionData;
    },
    findUser(userId) {
      const users = this.$store.state.users;
      if (users.length) {
        return users.find(user => userId.replace("%7C", "|") === user.user_id)
          .email;
      }
    },
    findRole(roleId) {
      const roles = this.$store.state.roles;
      if (roles.length) {
        return roles.find(role => roleId === role._id).name;
      }
    },
    async loadData() {
      this.isLoading = true;
      this.isSupervisor = this.$store.state.auth.user[
        "https://watchyourfac.es/userAuthorization"
      ].roles.includes("Supervisor");
      if (this.isSupervisor) {
        this.refreshUsers();
        this.refreshRoles();
        await this.getRequests();
      } else {
        await this.getRequests();
      }
      this.isLoading = false;
    },
    async getRequests() {
      try {
        const requests = await this.$axios.get("api/requests");
        this.pendingRequests = requests.data.result.requests;
      } catch (err) {
        console.log(err);
      }
    },
    refreshUsers() {
      this.$store.dispatch("refreshUsers");
    },
    refreshRoles() {
      this.$store.dispatch("refreshRoles");
    }
  }
};
</script>

<style>
div.admin {
  font-family: "Open Sans", sans-serif;
}
</style>
