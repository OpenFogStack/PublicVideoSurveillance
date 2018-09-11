<script>
export default {
  beforeCreate() {
    this.$auth.loginWith("auth0");
  }
};
</script>
