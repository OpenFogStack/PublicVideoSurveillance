<template>
  <div
    class="modal-card"
    width="960">
    <b-loading
      :active.sync="isLoading"
      :can-cancel="true"/>
    <header class="modal-card-head">
      <p class="modal-card-title">{{ user.nickname }}</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Email">
        <b-input
          v-model="email"
          type="email"
          required/>
      </b-field>
      <b-field label="Roles">
        <div class="block">
          <b-checkbox
            v-for="(role, key) in roles"
            v-model="checkboxGroup"
            :key="key"
            :native-value="role.name">
            {{ role.name }}
          </b-checkbox>
        </div>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button
        class="button"
        type="button"
        @click="$parent.close()">Close</button>
      <button
        class="button is-primary"
        @click="updateUser">Save</button>
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      default: () => {
        return {};
      },
      type: Object
    },
    isNew: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      checkboxGroup: this.user.hasOwnProperty("app_metadata")
        ? this.user.app_metadata.roles.slice(0)
        : [],
      roles: [],
      isLoading: false,
      email: this.user.email,
      nickname: this.user.nickname || []
    };
  },
  created() {
    if (!this.user.hasOwnProperty("app_metadata")) {
      this.user.app_metadata = { roles: [] };
    }
    this.getRoles();
  },
  methods: {
    async getRoles() {
      this.isLoading = true;
      const roles = await this.$axios.get("api/roles");
      this.roles = roles.data.result.roles;
      this.isLoading = false;
    },
    async updateUser() {
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Updating User...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        const rolesToAdd = this.checkboxGroup.filter(
          role => !this.user.app_metadata.roles.includes(role)
        );
        for (const roleName of rolesToAdd) {
          const role = this.roles.find(role => role.name === roleName);
          await this.$axios.patch(`api/users/${this.user.user_id}/roles`, {
            roleId: role._id
          });
        }

        const rolesToRemove = this.user.app_metadata.roles.filter(
          role => !this.checkboxGroup.includes(role)
        );
        for (const roleName of rolesToRemove) {
          const role = this.roles.find(role => role.name === roleName);
          await this.$axios.delete(`api/users/${this.user.user_id}/roles`, {
            data: {
              roleId: role._id
            }
          });
        }
        if (this.email !== this.user.email) {
          await this.$axios.put(`api/users/${this.user.user_id}`, {
            data: {
              connection: "Username-Password-Authentication",
              email: this.email
            }
          });
        }
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully updated User ${
            this.email
          }. Waiting for approval...`,
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
      } finally {
        this.$parent.close();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
div.card {
  max-width: 600px;
}
</style>
