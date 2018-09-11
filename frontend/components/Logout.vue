<template> 
  <a 
    href="#"
    class="button is-primary" 
    @click.stop="onLogoutClick">Logout</a>  
         
</template>

<script>
export default {
  methods: {
    onLogoutClick() {
      this.$auth.logout();
    }
  }
};
</script>

<style lang="scss" scoped>
div.card {
  max-width: 600px;
}
</style>
