<template>
  <div
    class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Create User</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Email">
        <b-input
          v-model="email"
          type="email"
          placeholder="Email"
          required/>
      </b-field>

      <b-field label="Password">
        <b-input
          v-model="password"
          type="password"
          password-reveal
          placeholder="Password"
          minlength="6"
          required/>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button
        class="button"
        type="button"
        @click="$parent.close()">Close</button>
      <button
        :disabled="isLoading"
        :class="{'is-loading': isLoading}"
        class="button is-primary"
        @click="createUser">Create</button>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      isLoading: false
    };
  },
  methods: {
    async createUser() {
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Creating User...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        this.isLoading = true;
        await this.$axios.post("api/users", {
          data: {
            connection: "Username-Password-Authentication",
            email: this.email,
            password: this.password
          }
        });
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully created User ${
            this.email
          }. Waiting for approval...`,
          position: "is-bottom",
          type: "is-success"
        });
        this.$parent.close();
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
        this.isLoading = false;
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
