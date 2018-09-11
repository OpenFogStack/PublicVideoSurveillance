<template>
  <div
    class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Your Keypair</p>
    </header>
    <section
      v-if="createdKeys"
      class="modal-card-body">
      <b-field label="Public Key">
        <b-field >
          <b-input
            v-model="publicKey"
            placeholder="Public Key"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(publicKey)">
                <b-icon
                  icon="content-copy" />
              </a>
            </b-tooltip>
          </p>
        </b-field>
      </b-field>
      <b-field label="Private Key">
        <b-field >
          <b-input
            v-model="privateKey"
            placeholder="Private Key"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(privateKey)">
                <b-icon
                  icon="content-copy" />
              </a>
            </b-tooltip>
          </p>
          <p class="control">
            <b-tooltip
              label="Download as file"
              position="is-bottom">
              <a
                class="button"
                @click="downloadFile(privateKey, 'wyf_private.key')">
                <b-icon
                  icon="download" />
              </a>
            </b-tooltip>
          </p>
        </b-field>
      </b-field>
    </section>
    <section
      v-else
      class="modal-card-body">
      <button
        :class="{'is-loading': isLoading}"
        class="button is-primary"
        @click="createKeys">Generate keys</button>
    </section>
    <footer class="modal-card-foot">
      <button
        class="button"
        type="button"
        @click="$parent.close()">Close</button>
    </footer>
  </div>
</template>

<script>
import keypair from "keypair";
import { saveAs } from "file-saver";

export default {
  data() {
    return {
      publicKey: "",
      privateKey: "",
      createdKeys: false,
      isLoading: false
    };
  },
  created() {},
  methods: {
    async copyToClipboard(text) {
      await this.$copyText(text);
      this.$toast.open({
        message: "Copied to clipboard",
        position: "is-bottom",
        queue: false
      });
    },
    downloadFile(content, fileName) {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, fileName);
    },
    createKeys() {
      this.isLoading = true;
      const pair = keypair();
      this.publicKey = pair.public;
      this.privateKey = pair.private;
      this.createdKeys = true;
      this.isLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-card-body {
  padding: 10px 50px 40px 50px;
}
.center {
}
</style>
