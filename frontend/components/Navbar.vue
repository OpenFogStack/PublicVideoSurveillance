<template>
  <!-- START NAV -->
  <nav class="navbar is-white">
    <div class="container">
      <div class="navbar-brand">
        <router-link
          to="/dashboard"
          class="navbar-item">
          <img
            src="~/assets/img/wyf-icon.png" >
        </router-link>
        <div
          :class="{ 'is-active': isMenuActive }"
          class="navbar-burger burger"
          @click="isMenuActive = !isMenuActive">
          <span/>
          <span/>
          <span/>
        </div>
      </div>
      <div
        id="navMenu"
        :class="{ 'is-active': isMenuActive }"
        class="navbar-menu">
        <div class="navbar-start">
          <router-link
            to="/dashboard"
            class="navbar-item">
            Home
          </router-link>
          <router-link
            v-if="this.$auth.loggedIn"
            to="/facehunts"
            class="navbar-item" >
            Facehunts
          </router-link>
          <router-link
            v-if="this.$auth.loggedIn"
            to="/requests"
            class="navbar-item" >
            Requests
          </router-link>
          <router-link
            v-if="roles.includes('Supervisor')"
            to="/approvals"
            class="navbar-item">
            Approvals
          </router-link>
          <router-link
            v-if="roles.includes('Supervisor')"
            to="/users"
            class="navbar-item">
            Users
          </router-link>
          <router-link
            v-if="roles.includes('Supervisor')"
            to="/edges"
            class="navbar-item">
            Edges
          </router-link>
          <router-link
            v-if="roles.includes('Supervisor')"
            to="/logs"
            class="navbar-item">
            Logs
          </router-link>
          <!--
          <router-link
            to="/admin"
            class="navbar-item" >
            Users
          </router-link> -->
        </div>
        <div class="navbar-end">
          <div
            v-if="this.$auth.loggedIn"
            class="navbar-item has-dropdown is-hoverable is-right">
            <a class="navbar-link">{{ userMail }}</a>
            <div
              class="navbar-dropdown">
              <a
                class="navbar-item button is-danger is-inverted"
                @click="onLogoutClick">
                <span class="icon">
                  <i class="mdi mdi-power mdi-24px" />
                </span>
                <span>Logout</span>
              </a>
            </div>
          </div>
          <div
            v-else
            class="navbar-item is-right login"
            @click="onLoginClick">
            Login
          </div>
        </div>
      </div>
  </div></nav>
  <!-- END NAV -->

</template>

<script>
export default {
  props: {
    userMail: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      isMenuActive: false
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
    }
  },
  methods: {
    closeMenu() {
      this.isMenuActive = false;
    },
    onLogoutClick() {
      this.$auth.logout();
      this.removeLoggedInKey();
    },
    onLoginClick() {
      this.$auth.loginWith("auth0");
    },
    removeLoggedInKey() {
      window.localStorage.removeItem("hasLoggedIn");
    }
  }
};
</script>

<style lang="scss" scoped>
nav.navbar {
  border-top: 4px solid #338078;
  margin-bottom: 1rem;
}
.navbar-brand {
  .navbar-item {
    padding: 5px;
    img {
      max-height: 3rem;
    }
  }
}
div.login:hover {
  cursor: pointer;
  background-color: #f2f2f2;
}

.navbar-item,
.navbar-link {
  font-size: 14px;
  font-weight: 700;
}
</style>
