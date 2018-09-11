<template>
  <div
    class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Details for {{ edgeId }}</p>
    </header>
    <section
      v-if="iotInformation.PublicKey === 'deleted'"
      class="modal-card-body">
      <strong>Credentials have already been downloaded!</strong>
    </section>
    <section
      v-else
      class="modal-card-body">
      <ul class="poi-details">
        <li><strong><em>Description</em></strong>: {{ edge.description }}</li>
        <li><strong><em>Created at</em></strong>: {{ edge.createdAt | timestamp }}</li>
      </ul>
      <b-field label="Public Key">
        <b-field>
          <b-input
            v-model="iotInformation.PublicKey"
            placeholder="Public Key"
            expanded />
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(iotInformation.PublicKey)">
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
                @click="downloadFile(iotInformation.PublicKey, 'public-key.txt')">
                <b-icon
                  icon="download" />
              </a>
          </b-tooltip></p>
        </b-field>
      </b-field>
      <b-field label="Private Key">
        <b-field >
          <b-input
            v-model="iotInformation.PrivateKey"
            placeholder="Private Key"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(iotInformation.PrivateKey)">
                <b-icon
                  icon="content-copy" />
              </a>
          </b-tooltip></p>
          <p class="control">
            <b-tooltip
              label="Download as file"
              position="is-bottom">
              <a
                class="button"
                @click="downloadFile(iotInformation.PrivateKey,'private-key.txt')">
                <b-icon
                  icon="download" />
              </a>
          </b-tooltip></p>
        </b-field>
      </b-field>
      <b-field label="Certificate Pem">
        <b-field>
          <b-input
            v-model="iotInformation.certificatePem"
            placeholder="Certificate Pem"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(iotInformation.certificatePem)">
                <b-icon
                  icon="content-copy" />
              </a>
          </b-tooltip></p>
          <p class="control">
            <b-tooltip
              label="Download as file"
              position="is-bottom">
              <a
                class="button"
                @click="downloadFile(iotInformation.certificatePem,'certificate-pem.txt')">
                <b-icon
                  icon="download" />
              </a>
          </b-tooltip></p>
        </b-field>
      </b-field>
      <b-field label="Certificate Id">
        <b-field>
          <b-input
            v-model="iotInformation.certificateId"
            placeholder="Certificate Id"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(iotInformation.certificateId)">
                <b-icon
                  icon="content-copy" />
              </a>
          </b-tooltip></p>
        </b-field>
      </b-field>
      <b-field label="IoT Endpoint">
        <b-field>
          <b-input
            v-model="iotInformation.iotEndpoint"
            placeholder="IoT Endpoint"
            expanded/>
          <p class="control">
            <b-tooltip
              label="Copy to clipboard"
              position="is-bottom">
              <a
                class="button"
                @click="copyToClipboard(iotInformation.iotEndpoint)">
                <b-icon
                  icon="content-copy" />
              </a>
          </b-tooltip></p>
        </b-field>
      </b-field>
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
import { saveAs } from "file-saver";
export default {
  props: {
    edgeId: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      edge: {},
      iotInformation: {}
    };
  },
  created() {
    this.getEdge();
  },
  methods: {
    async getEdge() {
      const edge = await this.$axios.get(`api/edge/${this.edgeId}`);
      await this.$axios.put(`api/edge/${this.edgeId}`);
      this.edge = edge.data.result.edge;
      this.iotInformation = this.edge.awsiotInformation;
    },
    downloadFile(content, fileName) {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, fileName);
    },
    async copyToClipboard(text) {
      await this.$copyText(text);
      this.$toast.open({
        message: "Copied to clipboard",
        position: "is-bottom",
        queue: false
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-card-body {
  padding: 10px 50px 40px 50px;
}
</style>
