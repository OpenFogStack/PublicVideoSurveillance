<template> 
  <a 
    href="#"
    class="button is-primary" 
    @click.stop="onLoginClick">Login</a>  
         
</template>

<script>
export default {
  methods: {
    onLoginClick() {
      this.$auth.loginWith("auth0");
    }
  }
};
</script>

<style lang="scss" scoped>
div.card {
  max-width: 600px;
}
</style>
