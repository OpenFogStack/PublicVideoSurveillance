<template>
  <div>
    <b-table
      :data="users"
      :default-sort-direction="'desc'"
      default-sort="started"
      hoverable
      focusable
      mobile-cards 
      @click="selectUser">      
      <template slot-scope="props">
        <b-table-column
          field="email"
          label="E-Mail"
          sortable>
          {{ props.row.email }}              
        </b-table-column>
        <b-table-column
          field="nickname"
          label="Nickname"
          sortable>
          {{ props.row.nickname }}              
        </b-table-column> 
        <b-table-column
          field="action"
          label="">
          <a
            class="button"
            @click.stop="deleteUser(props.row)">
            <b-icon
              icon="delete"
              type="is-danger" />
          </a>            
        </b-table-column>           
      </template>
      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon
                icon="emoticon-sad"
                size="is-large"/>
            </p>
            <p>No users!</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
import moment from "moment";
export default {
  props: {
    users: {
      default: () => {
        return [];
      },
      type: Array
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    selectUser(row) {
      console.log(`Selected ${row}`);
      this.$emit("click-user", row);
    },
    deleteUser(row) {
      console.log(`Delete ${row}`);
      this.$emit("delete-user", row);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
