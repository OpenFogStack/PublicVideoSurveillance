<template>
  <div
    class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Create Edge</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Id">
        <b-input
          v-model="id"
          placeholder="Edge Id"
          required/>
      </b-field>

      <b-field label="Description">
        <b-input
          v-model="description"
          placeholder="Description" />
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
        @click="createEdge">Create</button>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: "",
      description: "",
      isLoading: false
    };
  },
  methods: {
    async createEdge() {
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Creating Edge...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        this.isLoading = true;
        await this.$axios.post("api/edge", {
          id: this.id,
          description: this.description
        });
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully created Edge. Waiting for approval...`,
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
