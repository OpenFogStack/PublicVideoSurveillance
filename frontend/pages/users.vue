<template>
  <div class="admin">
    <b-modal
      :active.sync="isUsersModalActive"
      has-modal-card>
      <edit-user-modal
        :user="selectedUser"/>
    </b-modal>
    <b-modal
      :active.sync="isCreateUserModalActive"
      has-modal-card>
      <create-user-modal />
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
                      aria-label="Create User"
                      @click="openCreateUserModal">
                      <b-icon
                        icon="account-plus"
                      />
                    </a>
                  </p>
                  <a
                    class="card-header-icon"
                    aria-label="more options"
                    @click="refreshUsers">
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
                      :data="$store.state.users"
                      :loading="$store.state.isUpdatingUsers && $store.state.users.length <= 0"
                      :default-sort-direction="'desc'"
                      default-sort="created">
                      <template slot-scope="props">
                        <b-table-column
                          field="email"
                          label="E-Mail"
                          sortable>
                          {{ props.row.email }}
                        </b-table-column>
                        <b-table-column
                          :custom-sort="sortCreated"
                          field="created"
                          label="Created at"
                          sortable>
                          {{ props.row.created_at | timestamp }}
                        </b-table-column>
                        <b-table-column
                          :custom-sort="sortLogin"
                          field="last_login"
                          label="Last Login"
                          sortable>
                          {{ props.row.last_login | timestamp }}
                        </b-table-column>
                        <b-table-column
                          field="roles"
                          label="Roles">
                          <b-taglist
                            v-if="props.row.app_metadata">
                            <b-tag
                              v-for="(role, key) of props.row.app_metadata.roles"
                              :key="key"
                              type="is-primary">
                              {{ role }}
                            </b-tag>
                          </b-taglist>
                        </b-table-column>
                        <b-table-column field="delete">
                          <a
                            class="button"
                            @click="openUserDetails(props.row)">
                            <b-icon
                              icon="pencil"/>
                          </a>
                          <a
                            class="button"
                            @click="openDeleteUserDialog(props.row)">
                            <b-icon
                              icon="delete"
                              type="is-danger" />
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
import moment from "moment";
import Header from "~/components/Header";
import Breadcrumbs from "~/components/Breadcrumbs";
import EditUserModal from "~/components/EditUserModal";
import CreateUserModal from "~/components/CreateUserModal";

export default {
  components: {
    headerComponent: Header,
    Breadcrumbs,
    EditUserModal,
    CreateUserModal
  },
  data() {
    return {
      isLoading: false,
      isUsersModalActive: false,
      isCreateUserModalActive: false,
      selectedUser: {},
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          name: "Users"
        }
      ]
    };
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.refreshUsers();
  },
  middleware: "isSupervisor",
  methods: {
    openDeleteUserDialog(user) {
      this.isUsersModalActive = false;
      this.$dialog.confirm({
        message: `Are you sure you want to delete <em>${
          user.email
        }</em>? This cannot be undone`,
        onConfirm: () => this.deleteUser(user),
        confirmText: "Delete User",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deleteUser(user) {
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Deleting User...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        await this.$axios.delete(`api/users/${user.user_id}`);
        this.$toast.open({
          duration: 1000,
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully deleted User. Waiting for approval...`,
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
    refreshUsers() {
      this.$store.dispatch("refreshUsers");
    },
    openUserDetails(user) {
      this.selectedUser = user;
      this.isUsersModalActive = true;
    },
    openCreateUserModal() {
      this.isCreateUserModalActive = true;
    },
    sortCreated(a, b, isAsc) {
      if (isAsc) {
        return moment(a.created_at) - moment(b.created_at);
      } else {
        return moment(b.created_at) - moment(a.created_at);
      }
    },
    sortLogin(a, b, isAsc) {
      if (isAsc) {
        return moment(a.last_login) - moment(b.last_login);
      } else {
        return moment(b.last_login) - moment(a.last_login);
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
