<template>
  <nav
    class="breadcrumb"
    aria-label="breadcrumbs">
    <ul>
      <li
        v-for="breadcrumb in entries"
        :key="breadcrumb.name"
        :class="{'is-active': !breadcrumb.to}">
        <router-link
          :to="breadcrumb.to? breadcrumb.to: ''"
          class="is-primary" >{{ breadcrumb.name }}</router-link></li>
    </ul>
  </nav>

</template>

<script>
export default {
  props: {
    entries: {
      default: () => {
        return [];
      },
      type: Array
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
