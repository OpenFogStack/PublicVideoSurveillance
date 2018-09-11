<template>
  <div class="tile is-parent">
    <article 
      :class="{ 'updated' : isUpdating}" 
      class="tile is-child box">
      <a
        class="tile-icon"
        @click="refresh">
        <span class="icon">
          <i 
            class="mdi mdi-sync mdi-24px"
            aria-hidden="true"/>
        </span>
      </a>
      <p class="title">
        <router-link :to="link">{{ title }}</router-link>
      </p>
      <p class="subtitle">{{ subtitle }}</p>
    </article>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      default: () => {
        return "";
      },
      type: String
    },
    subtitle: {
      default: () => {
        return "";
      },
      type: String
    },
    link: {
      default: () => {
        return "";
      },
      type: String
    }
  },
  data() {
    return {
      isUpdating: false
    };
  },
  watch: {
    title: function(newValue, oldValue) {
      if (newValue !== oldValue && oldValue !== "" && newValue !== "") {
        this.isUpdating = true;
        setTimeout(() => (this.isUpdating = false), 250);
      }
    }
  },
  methods: {
    refresh() {
      this.$emit("refresh");
    }
  }
};
</script>

<style lang="scss" scoped>
.info-tiles {
  margin: 1rem 0;
  .tile.is-child.box {
    position: relative;
    transition: all 1.5s ease-in-out;
    background: #ffffff;
    .subtitle {
      transition: all 0.8s ease-in-out;
    }
    &.updated {
      background: #36d1dc;
      transition: all 0.2s ease-in-out;
      .subtitle {
        transition: all 0.2s ease-in-out;
        color: white;
      }
    }
  }
}
.info-tiles .tile-icon {
  position: absolute;
  right: 0;
  top: 0;
  padding: 5px;
}
.info-tiles .subtitle {
  font-weight: 300;
  color: #8f99a3;
}
</style>
