import Vuex from "vuex";

const createStore = () => {
  return new Vuex.Store({
    state: {
      users: [],
      isUpdatingUsers: false,
      roles: [],
      isUpdatingRoles: false
    },
    mutations: {
      SET_USERS(state, users) {
        state.users = users;
        state.isUpdatingUsers = false;
      },
      SET_USERS_UPDATING(state, isUpdating = true) {
        state.isUpdatingUsers = isUpdating;
      },
      SET_ROLES(state, roles) {
        state.roles = roles;
        state.isUpdatingRoles = false;
      },
      SET_ROLES_UPDATING(state, isUpdating = true) {
        state.isUpdatingRoles = isUpdating;
      }
    },
    actions: {
      async refreshUsers({ commit }) {
        commit("SET_USERS_UPDATING");
        try {
          const usersRes = await this.$axios.$get("api/users");
          const users = usersRes.result;
          commit("SET_USERS", users);
        } catch (error) {
        } finally {
          commit("SET_USERS_UPDATING", false);
        }
      },
      async refreshRoles({ commit }) {
        commit("SET_ROLES_UPDATING");
        try {
          const rolesRes = await this.$axios.$get("api/roles");
          const roles = rolesRes.result.roles;
          commit("SET_ROLES", roles);
        } catch (error) {
        } finally {
          commit("SET_ROLES_UPDATING", false);
        }
      }
    }
  });
};

export default createStore;
