<template>
  <section class="section"/>
</template>

<script>
import Login from "~/components/Login";
import Logout from "~/components/Logout";
export default {
  components: {
    Login,
    Logout
  },
  data() {
    return {};
  },
  beforeCreate() {
    this.$router.push(`/dashboard`);
  },
  methods: {
    printAuthInfo() {
      console.dir(this.$auth);
    }
  }
};
</script>

<style>
</style>
