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
                    Logs
                  </p>
                  <a
                    class="card-header-icon"
                    aria-label="more options"
                    @click="loadData">
                    <span class="icon">
                      <i
                        class="mdi mdi-sync mdi-24px"
                        aria-hidden="true"/>
                    </span>
                  </a>
                </header>
                <div class="card-content">
                  <b-field>
                    <b-radio-button
                      v-model="filterType"
                      :native-value="FILTER_TYPES.ALL">
                      <span>All</span>
                    </b-radio-button>

                    <b-radio-button
                      v-model="filterType"
                      :native-value="FILTER_TYPES.RESOURCE_TYPE">
                      <span>By Resource Type</span>
                    </b-radio-button>
                    <b-radio-button
                      v-model="filterType"
                      :native-value="FILTER_TYPES.RESOURCE">
                      By Resource
                    </b-radio-button>

                    <b-radio-button
                      v-model="filterType"
                      :native-value="FILTER_TYPES.USER">
                      By User
                    </b-radio-button>
                  </b-field>
                  <b-field>
                    <b-select
                      v-if="filterType === FILTER_TYPES.RESOURCE || filterType === FILTER_TYPES.RESOURCE_TYPE"
                      v-model="resourceType"
                      placeholder="ResourceType" >
                      <option
                        v-for="type in resourceTypes"
                        :value="type"
                        :key="type" >
                        {{ type }}
                      </option>
                    </b-select>

                    <b-input
                      v-if="filterType === FILTER_TYPES.RESOURCE"
                      v-model="resourceId"
                      placeholder="ResourceId"/>
                    <b-autocomplete
                      v-if="filterType === FILTER_TYPES.USER"
                      v-model="autocomplete"
                      :data="filteredDataArray"
                      :keep-first="true"
                      field="email"
                      placeholder="Filter"
                      icon="filter-outline"
                      @select="selectUser">
                      <template slot="empty">No results found</template>
                    </b-autocomplete>
                    <p class="control"> <a
                      v-if="filterType === FILTER_TYPES.RESOURCE || filterType === FILTER_TYPES.USER"
                      class="button is-primary"
                      @click="fetchLogs">Load logs</a></p>

                  </b-field>
                </div>
                <div class="card-table">
                  <div class="content">
                    <b-table
                      :data="paginatedLogs"
                      :paginated="true"
                      :per-page="10"
                      :loading="isLoading"
                      :default-sort-direction="'desc'"
                      :pagination-simple="true"
                      default-sort="Time"
                      detailed
                      detail-key="Id">
                      <template slot-scope="props">
                        <b-table-column
                          field="Action"
                          label="Action"
                          sortable>
                          {{ props.row.Action }}
                        </b-table-column>
                        <b-table-column
                          field="Actor"
                          label="Actor"
                          sortable>
                          {{ props.row.Actor | formatUser }}
                        </b-table-column>
                        <b-table-column
                          :custom-sort="sortTime"
                          field="Time"
                          label="Time"
                          sortable>
                          {{ props.row.Timestamp | timestamp }}
                        </b-table-column>
                      </template>
                      <template
                        slot="detail"
                        slot-scope="props">

                        <div class="content">
                          <vue-json-pretty
                            :deep="2"
                            :data="props.row" />
                        </div>
                      </template>
                      <template slot="bottom-left">
                        <a
                          v-if="logRequestData.exclusiveStartKey"
                          class="button is-primary"
                          @click="fetchLogs">Load more</a>
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
import VueJsonPretty from "vue-json-pretty";
import { RESOURCE_TYPES } from "wyf-constants";
import Header from "~/components/Header";
import Breadcrumbs from "~/components/Breadcrumbs";

const FILTER_TYPES = {
  ALL: "all",
  RESOURCE_TYPE: "resourceType",
  RESOURCE: "resource",
  USER: "user"
};

export default {
  components: {
    headerComponent: Header,
    Breadcrumbs,
    VueJsonPretty
  },
  data() {
    return {
      isLoading: false,
      FILTER_TYPES,
      paginatedLogs: [],
      logRequestData: {
        exclusiveStartKey: undefined,
        pageSize: 20
      },
      defaultOpenedDetails: [1],
      resourceTypes: RESOURCE_TYPES,
      filterType: FILTER_TYPES.ALL,
      resourceType: RESOURCE_TYPES.POI,
      resourceId: "",
      userId: "",
      autocomplete: "",
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          name: "Logs"
        }
      ]
    };
  },
  computed: {
    filteredDataArray() {
      if (!this.users || this.users.size <= 0) {
        return [];
      }

      const inputRegEx = new RegExp(this.autocomplete, "i");
      return this.users.filter(user => user.email.match(inputRegEx));
    }
  },
  watch: {
    filterType(newData) {
      this.resetLogData();
      this.fetchLogs();
    },
    resourceType(newData) {
      this.resetLogData();
      this.fetchLogs();
    },
    resourceId(newData) {
      this.resetLogData();
    }
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.loadData();
    const isLoggedIn = this.$store.state.auth.loggedIn;
    if (!isLoggedIn) {
      this.$router.push("/logout");
    } else {
      const roles = this.$store.state.auth.user[
        "https://watchyourfac.es/userAuthorization"
      ].roles;
    }
  },
  middleware: "isSupervisor",
  methods: {
    resetLogData() {
      this.logRequestData = {
        exclusiveStartKey: undefined,
        pageSize: 20
      };
      this.paginatedLogs = [];
    },
    resetLogs() {
      this.resetLogData();
      this.filterType = FILTER_TYPES.ALL;
      this.resourceType = RESOURCE_TYPES.POI;
      this.resourceId = "";
      this.userId = "";
    },
    findUser(userId) {
      return $store.state.users.find(
        user => userId.replace("%7C", "|") === user.user_id
      ).email;
    },
    findRole(roleId) {
      return $store.state.roles.find(role => roleId === role._id).name;
    },
    selectUser(user) {
      this.resetLogData();
      if (user && user.user_id) {
        this.userId = user.user_id;
        this.fetchLogs();
      }
    },
    async loadData() {
      this.isLoading = true;
      this.resetLogs();
      this.refreshUsers();
      this.refreshRoles();
      await this.fetchLogs();
      this.isLoading = false;
    },
    async fetchLogs() {
      try {
        let logs = [];
        switch (this.filterType) {
          case FILTER_TYPES.ALL:
            logs = await this.fetchAllLogs(
              this.logRequestData.pageSize,
              this.logRequestData.exclusiveStartKey
            );
            break;
          case FILTER_TYPES.RESOURCE_TYPE:
            logs = await this.fetchLogsByResourceType(
              this.resourceType,
              this.logRequestData.pageSize,
              this.logRequestData.exclusiveStartKey
            );
            break;
          case FILTER_TYPES.RESOURCE:
            logs = await this.fetchLogsByResource(
              this.resourceType,
              this.resourceId,
              this.logRequestData.pageSize,
              this.logRequestData.exclusiveStartKey
            );
            break;
          case FILTER_TYPES.USER:
            logs = await this.fetchLogsByUser(
              this.userId,
              this.logRequestData.pageSize,
              this.logRequestData.exclusiveStartKey
            );
            break;
        }
        this.paginatedLogs = this.paginatedLogs.concat(logs.data.result.logs);
        this.logRequestData.exclusiveStartKey = logs.data.result
          .LastEvaluatedKey
          ? logs.data.result.LastEvaluatedKey
          : undefined;
      } catch (err) {
        console.log(err);
      }
    },

    async fetchAllLogs(pageSize, exclusiveStartKey) {
      return await this.$axios.get("api/logs", {
        params: {
          pageSize,
          exclusiveStartKey
        }
      });
    },
    async fetchLogsByResourceType(type, pageSize, exclusiveStartKey) {
      if (!type) {
        return [];
      }
      return await this.$axios.get(`api/logs/${type}`, {
        params: {
          pageSize,
          exclusiveStartKey
        }
      });
    },
    async fetchLogsByResource(type, id, pageSize, exclusiveStartKey) {
      if (!type || !id) {
        return [];
      }
      return await this.$axios.get(`api/logs/${type}/${id}`, {
        params: {
          pageSize,
          exclusiveStartKey
        }
      });
    },
    async fetchLogsByUser(id, pageSize, exclusiveStartKey) {
      if (!id) {
        return [];
      }
      return await this.$axios.get(`api/user-logs/${id}`, {
        params: {
          pageSize,
          exclusiveStartKey
        }
      });
    },

    refreshUsers() {
      this.$store.dispatch("refreshUsers");
    },
    refreshRoles() {
      this.$store.dispatch("refreshRoles");
    },

    sortTime(a, b, isAsc) {
      if (isAsc) {
        return a.Timestamp - b.Timestamp;
      } else {
        return b.Timestamp - a.Timestamp;
      }
    }
  }
};
</script>

<style>
div.admin {
  font-family: "Open Sans", sans-serif;
}
</style>
