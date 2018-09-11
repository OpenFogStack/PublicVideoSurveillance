<template>
  <div
    class="modal-card"
    width="960">
    <b-loading
      :active.sync="isLoading"
      :can-cancel="true"/>
    <header class="modal-card-head">
      <p class="modal-card-title">Choose User</p>
    </header>
    <section class="modal-card-body">
      <b-autocomplete
        v-model="autocomplete"
        :data="filter"
        :keep-first="true"
        placeholder="Search for a user"
        icon="magnify"
        @select="selectUser">
        <template slot-scope="props">
          {{ props.option.email }}
        </template>
        <template slot="empty">No results found</template>
      </b-autocomplete>
      <b-table
        :data="users"
        :loading="isLoading"
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
            :custom-sort="sortTime"
            field="last_login"
            label="Last Login"
            sortable>
            {{ props.row.last_login | timestamp }}
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
              <p>Nothing here.</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
import moment from "moment";
export default {
  props: {
    allUsers: {
      default: () => {
        return [];
      },
      type: Array
    },
    addedUsers: {
      default: () => {
        return [];
      },
      type: Array
    }
  },
  data() {
    return {
      isLoading: false,
      autocomplete: ""
    };
  },
  computed: {
    filteredDataArray() {
      console.dir(this.users);
      const filterByEmail = this.users
        .filter(user => {
          console.dir(user);
          return (
            user.email
              .toString()
              .toLowerCase()
              .indexOf(this.autocomplete.toLowerCase()) >= 0
          );
        })
        .map(user => {
          return user.email;
        });

      const filterByName = this.users
        .filter(user => {
          if (user.name) {
            return (
              user.name
                .toString()
                .toLowerCase()
                .indexOf(this.autocomplete.toLowerCase()) >= 0
            );
          } else {
            return false;
          }
        })
        .map(user => {
          return user.name;
        });

      const filterByNickname = this.users
        .filter(user => {
          if (user.nickname) {
            return (
              user.nickname
                .toString()
                .toLowerCase()
                .indexOf(this.autocomplete.toLowerCase()) >= 0
            );
          } else {
            return false;
          }
        })
        .map(user => {
          return user.nickname;
        });
      return filterByEmail.concat(filterByName, filterByNickname);
    },
    filter() {
      const inputRegEx = new RegExp(this.autocomplete, "i");
      return this.users.filter(user => {
        if (!user.email) {
          user.email = "";
        }
        if (!user.name) {
          user.name = "";
        }
        if (!user.nickname) {
          user.nickname = "";
        }
        return (
          user.email.match(inputRegEx) ||
          user.name.match(inputRegEx) ||
          user.nickname.match(inputRegEx)
        );
      });
    },
    users() {
      return this.allUsers.filter(
        user =>
          !this.addedUsers.some(addedUser => addedUser.userId === user.user_id)
      );
    }
  },
  methods: {
    selectUser(row) {
      this.$emit("user-selected", row);
      this.$parent.close();
    },
    sortTime(a, b, isAsc) {
      if (isAsc) {
        return moment(a.last_login) - moment(b.last_login);
      } else {
        return moment(b.last_login) - moment(a.last_login);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
tr {
  cursor: pointer;
}
</style>
