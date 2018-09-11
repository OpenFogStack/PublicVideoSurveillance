<template>
  <b-notification
    v-if="pendingApprovals > 0"
    :closable="false"
    type="is-info">
    <div class="has-text-centered">There are <router-link
      to="/approvals"><strong>{{ pendingApprovals }}</strong> </router-link> pending approvals.</div>
  </b-notification>
</template>

<script>
export default {
  data() {
    return {
      pendingApprovals: 0
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
  created() {
    this.getApprovals();
  },
  methods: {
    async getApprovals() {
      if (!this.roles.includes("Supervisor")) return;
      const approvals = await this.$axios.get("api/approvalitems");
      this.pendingApprovals = approvals.data.result.approvalItems.length;
    }
  }
};
</script>

<style>
.center {
  text-align: center;
}
</style>
