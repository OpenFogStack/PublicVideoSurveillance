<template>
  <section class="section">
    <div class="columns">
      <div class="column image-upload">
        <b-field
          label="Images">
          <b-upload
            v-model="images"
            multiple
            drag-drop
            accept="image/jpeg"
            @input="$emit('add-image', images)"
          >
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                    icon="upload"
                    size="is-large"/>
                </p>
                <p>Drop your files here or click to upload. Please make sure that you have not uploaded this image before by checking your requests.</p>
              </div>
            </section>
          </b-upload>
        </b-field>
      </div>
      <div class="column image-preview">
        <label class="label">
          To Upload:
        </label>
        <div class="tags">
          <span
            v-for="(image, index) in images"
            :key="index"
            class="tag is-primary" >
            {{ image.name }}
            <button
              class="delete is-small"
              type="button"
              @click="deleteImage(index)"/>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    deleteImage(index) {
      this.images.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
