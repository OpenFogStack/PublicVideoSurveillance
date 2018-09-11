<template>
  <div class="admin">
    <b-modal
      :active.sync="isCreateKeypairModalActive"
      has-modal-card>
      <create-key-pair-modal />
    </b-modal>
    <header-component />
    <b-notification
      :active.sync="isFirstLogin"
      type="is-warning">
      <div class="has-text-centered">This is your first login. Click <a @click="openCreateKeypairModal">here</a> to generate a public/private key pair. This might take a while.</div>
    </b-notification>
    <div class="container">
      <div class="columns">
        <div class="column is-12">
          <breadcrumbs :entries="breadcrumbs"/>
          <section class="hero is-primary welcome is-small">
            <div class="hero-body">
              <div class="container">
                <h1 class="title">
                  Hello, {{ $store.state.auth.user.nickname | auth0name }}
                </h1>
                <h2 class="subtitle">
                  I hope you are having a great day!
                </h2>
              </div>
            </div>
          </section>
          <section class="info-tiles">
            <div class="tile is-ancestor has-text-centered">
              <b-loading
                :active.sync="isLoading"
                :can-cancel="true"
                :is-full-page="false"/>
              <title-tile
                :title="facehuntCount"
                subtitle="Facehunts"
                link="/facehunts"
                @refresh="refreshDashboard"/>
              <title-tile
                v-if="roles.includes('Supervisor')"
                :title="approvalCount"
                subtitle="Approvals"
                link="/approvals"
                @refresh="refreshDashboard"/>
              <title-tile
                v-if="roles.includes('Supervisor')"
                :title="usersCount"
                subtitle="Users"
                link="/users"
                @refresh="refreshDashboard"/>
              <title-tile
                v-if="roles.includes('Supervisor')"
                :title="edgesCount"
                subtitle="Edges"
                link="/edges"
                @refresh="refreshDashboard"/>
            </div>
          </section>
          <section class="poi-card">
            <div class="columns">
              <div class="column is-12">
                <create-poi-card @submit-poi="refreshDashboard"/>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from "~/components/Menu";
import Breadcrumbs from "~/components/Breadcrumbs";
import CreatePoiCard from "~/components/CreatePoiCard";
import Header from "~/components/Header";
import RefreshableTitleTile from "~/components/tiles/RefreshableTitleTile";
import CreateKeyPairModal from "~/components/CreateKeyPairModal";

export default {
  components: {
    headerComponent: Header,
    SideMenu,
    Breadcrumbs,
    CreatePoiCard,
    titleTile: RefreshableTitleTile,
    CreateKeyPairModal
  },
  filters: {
    auth0name(value) {
      if (!value) return "";
      value = value.toString();
      value = value.split(".")[0];
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  data() {
    return {
      isMenuActive: false,
      facehuntCount: "",
      approvalCount: "",
      edgesCount: "",
      breadcrumbs: [
        {
          name: "Dashboard"
        }
      ],
      isLoading: false,
      refreshInterval: undefined,
      isCreateKeypairModalActive: false
    };
  },
  computed: {
    roles() {
      if (this.$store.state.auth.loggedIn) {
        return this.$store.state.auth.user[
          "https://watchyourfac.es/userAuthorization"
        ].roles;
      } else {
        return [];
      }
    },

    isFirstLogin() {
      if (this.$store.state.auth.loggedIn) {
        return this.$store.state.auth.user[
          "https://watchyourfac.es/first_login"
        ];
      }
    },
    usersCount() {
      const userCount = this.$store.state.users.length.toString();
      const isUpdatingUsers = this.$store.state.isUpdatingUsers;
      return userCount == 0 && isUpdatingUsers ? "" : userCount;
    }
  },
  created() {
    if (!this.$store.state.auth.loggedIn) {
      this.$router.push(`/login`);
      return;
    }
    this.printAscii();
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
  },
  mounted() {
    this.refreshInterval = setInterval(
      () => this.refreshDashboard(true),
      30000
    );
    this.refreshDashboard();
    this.logLogin();
  },
  beforeDestroy() {
    clearInterval(this.refreshInterval);
  },
  methods: {
    closeMenu() {
      this.isMenuActive = false;
    },
    async refreshDashboard(silent) {
      if (!silent) {
        this.isLoading = true;
      }
      try {
        await Promise.all([
          this.refreshFacehunts(),
          this.refreshApprovals(),
          this.refreshUsers(),
          this.refreshEdges()
        ]);
      } catch (error) {}
      this.isLoading = false;
    },
    async refreshUsers() {
      if (!this.roles.includes("Supervisor")) {
        return;
      }
      this.$store.dispatch("refreshUsers");
    },
    async refreshEdges() {
      if (!this.roles.includes("Supervisor")) {
        return;
      }
      try {
        const edgesRes = await this.$axios.$get("/api/edge");
        this.edgesCount = edgesRes.result.edges.length.toString();
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          }</div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    async refreshFacehunts() {
      try {
        const facehuntsRes = await this.$axios.$get("/api/pois");
        this.facehuntCount = facehuntsRes.result.pois.length.toString();
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          }</div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    async refreshApprovals() {
      if (!this.roles.includes("Supervisor")) {
        return;
      }
      try {
        const approvalsRes = await this.$axios.$get("/api/approvalitems");
        this.approvalCount = approvalsRes.result.approvalItems.length.toString();
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          }</div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    openCreateKeypairModal() {
      this.isCreateKeypairModalActive = true;
    },
    async logLogin() {
      const currentAccessToken = this.$auth.$storage.getUniversal(
        "_token.auth0"
      );
      if (
        window.localStorage.getItem("hasLoggedIn") === "true" &&
        window.localStorage.getItem("loggedAccessToken") === currentAccessToken
      ) {
        // login was already logged
        return;
      }
      try {
        await this.$axios.$post("/api/user-logs/login", {});
        window.localStorage.setItem("hasLoggedIn", "true");
        window.localStorage.setItem("loggedAccessToken", currentAccessToken);
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          }</div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    printAscii() {
      const text = `
              ####  ###
            ###       ###
          #####         ###
        /##   ###         ###
          ####   ###         ###
        ###  ###   ###         ###
        ###   ###   ###         ###
          ###   ###   #(          ###
            ###   ###               ###
              ###   ###      #####    ###
##.             ###   ###        /###   ###
##.               ###   ###         ###   ###
##.              ######   ###         ###   ###         We are watching you
##.            ###   ####   ###         ###   ###
##.          ###   ###  ###   ###         ###  /##,       watchyourfac.es
################ ###      ###   ###        /####
##.      ## #/ ###          ###   ###  /#######
###########   /##             ###   #########
##.       (####.                #####    ##
##.                               (
##.
##.
##.
.#     `;

      console.log(text);
    }
  }
};
</script>

<style lang="scss" scoped>
div.admin {
  font-family: "Open Sans", sans-serif;
}

.card {
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.18);
  margin-bottom: 2rem;
}
.card-header-title {
  color: #8f99a3;
  font-weight: 400;
}
.info-tiles {
  margin: 1rem 0;
}
.hero.welcome.is-info {
  background: #36d1dc;
  background: -webkit-linear-gradient(to right, #5b86e5, #36d1dc);
  background: linear-gradient(to right, #5b86e5, #36d1dc);
}
.hero.welcome .title,
.hero.welcome .subtitle {
  color: hsl(192, 17%, 99%);
}
.card .content {
  font-size: 14px;
}
.card-footer-item {
  font-size: 14px;
  font-weight: 700;
  color: #8f99a3;
}
.card-table .table {
  margin-bottom: 0;
}
.events-card .card-table {
  max-height: 250px;
  overflow-y: scroll;
}
.tile {
  position: relative;
}
.center {
  text-align: center;
}
</style>
