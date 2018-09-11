<template>
  <div class="card events-card">
    <header class="card-header">
      <div class="card-header-title">
        Logs for {{ poi.firstName }} {{ poi.lastName }}
      </div>
    </header>
    <div class="card-content">
      <b-tabs v-model="activeTab">
        <b-tab-item label="Logs">
          <b-table
            :data="logs"
            :paginated="true"
            :per-page="7"
            :loading="isLoadingLogs"
            :default-sort-direction="'desc'"
            default-sort="Time">
            <template slot-scope="props">
              <b-table-column
                field="Action"
                label="Action"
                sortable>
                {{ props.row.Action }}
              </b-table-column>
              <b-table-column
                field="Actor"
                label="Actor"
                sortable>
                {{ props.row.Actor | formatUser }}
              </b-table-column>
              <b-table-column
                :custom-sort="sortTime"
                field="Time"
                label="Time"
                sortable>
                {{ props.row.Timestamp | timestamp }}
              </b-table-column>
            </template>
          </b-table>
        </b-tab-item>
        <b-tab-item label="Raw data">
          <vue-json-pretty
            :deep="2"
            :data="logs" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
export default {
  components: { VueJsonPretty },
  props: {
    poi: {
      default: () => {},
      type: Object
    }
  },
  data() {
    return { isLoadingLogs: false, activeTab: 0, logs: [] };
  },
  async created() {
    this.isLoadingLogs = true;
    this.logs = await this.fetchLogs(this.poi.id);
    this.isLoadingLogs = false;
  },
  methods: {
    async fetchLogs(id) {
      let logs = [];
      try {
        const logsRes = await this.$axios.$get(`/api/logs/POI/${id}`);
        logs = logsRes.result.logs;
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: err.message,
          position: "is-bottom",
          type: "is-danger"
        });
      }
      console.dir(logs);
      return logs;
    },
    sortTime(a, b, isAsc) {
      if (isAsc) {
        return a.Timestamp - b.Timestamp;
      } else {
        return b.Timestamp - a.Timestamp;
      }
    }
  }
};
</script>
