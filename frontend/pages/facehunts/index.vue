<template>
  <div class="admin">
    <header-component />
    <div class="container">
      <div class="columns">
        <div class="column is-12">
          <breadcrumbs :entries="breadcrumbs" />
          <div class="columns">
            <div class="column is-12">
              <div class="card events-card">
                <header class="card-header">
                  <p class="card-header-title">
                    <b-autocomplete
                      v-model="autocomplete"
                      :data="filteredDataArray"
                      :keep-first="true"
                      placeholder="Filter"
                      icon="filter-outline">
                      <template slot="empty">No results found</template>
                    </b-autocomplete>
                  </p>
                  <a
                    class="card-header-icon"
                    aria-label="more options"
                    @click="refreshFaceHunts">
                    <span class="icon">
                      <i
                        class="mdi mdi-sync mdi-24px"
                        aria-hidden="true"/>
                    </span>
                  </a>
                </header>
                <div class="card-table">
                  <div class="content">
                    <b-table
                      :data="filter"
                      :loading="isLoading"
                      :default-sort-direction="'desc'"
                      default-sort="started"
                      @click="openFaceHuntDetail">
                      <template slot-scope="props">
                        <b-table-column
                          field="id"
                          label="Id"
                          sortable>
                          {{ props.row.id }}
                        </b-table-column>
                        <b-table-column
                          field="firstName"
                          label="First Name"
                          sortable
                        >
                          {{ props.row.firstName }}
                        </b-table-column>
                        <b-table-column
                          field="lastName"
                          label="Last Name"
                          sortable>
                          {{ props.row.lastName }}
                        </b-table-column>
                        <b-table-column
                          :custom-sort="sortTime"
                          field="started"
                          label="Started"
                          sortable>
                          {{ props.row.createdAt | timestamp }}
                        </b-table-column>
                        <b-table-column
                          field="images"
                          label="Images"
                          sortable
                        >
                          {{ props.row.images.length }}
                        </b-table-column>
                        <b-table-column
                          field="footages"
                          label="Footages"
                          sortable
                        >
                          {{ props.row.footages.length }}
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
                  </div>
                </div>
                <footer class="card-footer"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</div></template>

<script>
import Header from "~/components/Header";
import SideMenu from "~/components/Menu";
import Breadcrumbs from "~/components/Breadcrumbs";

export default {
  components: { headerComponent: Header, SideMenu, Breadcrumbs },
  data() {
    return {
      isMenuActive: false,
      facehunts: [],
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          name: "Facehunts"
        }
      ],
      isLoading: false,
      autocomplete: ""
    };
  },
  computed: {
    filteredDataArray() {
      const filterById = this.facehunts
        .filter(facehunt => {
          return (
            facehunt.id
              .toString()
              .toLowerCase()
              .indexOf(this.autocomplete.toLowerCase()) >= 0
          );
        })
        .map(facehunt => {
          return facehunt.id;
        });

      const filterByFirstName = this.facehunts
        .filter(facehunt => {
          return (
            facehunt.firstName
              .toString()
              .toLowerCase()
              .indexOf(this.autocomplete.toLowerCase()) >= 0
          );
        })
        .map(facehunt => {
          return facehunt.firstName;
        });

      const filterByLastName = this.facehunts
        .filter(facehunt => {
          return (
            facehunt.lastName
              .toString()
              .toLowerCase()
              .indexOf(this.autocomplete.toLowerCase()) >= 0
          );
        })
        .map(facehunt => {
          return facehunt.lastName;
        });
      return filterById.concat(filterByFirstName, filterByLastName);
    },
    filter() {
      const inputRegEx = new RegExp(this.autocomplete, "i");
      return this.facehunts.filter(
        facehunt =>
          facehunt.id.match(inputRegEx) ||
          facehunt.firstName.match(inputRegEx) ||
          facehunt.lastName.match(inputRegEx)
      );
    }
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.refreshFaceHunts();
  },
  methods: {
    closeMenu() {
      this.isMenuActive = false;
    },
    async refreshFaceHunts() {
      try {
        this.isLoading = true;
        const pois = await this.$axios.$get("/api/pois");
        this.isLoading = false;
        this.facehunts = pois.result.pois;
      } catch (err) {
        console.log(err);
        this.isLoading = false;
        this.$toast.open({
          duration: 1000,
          message: err.message,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    openFaceHuntDetail(row) {
      return this.$router.push({ path: `/facehunts/${row.id}` });
    },
    sortTime(a, b, isAsc) {
      if (isAsc) {
        return a.createdAt - b.createdAt;
      } else {
        return b.createdAt - a.createdAt;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
div.admin {
  font-family: "Open Sans", sans-serif;
}

.card {
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.18);
  margin-bottom: 2rem;
}
.card-header-title {
  color: #8f99a3;
  font-weight: 400;
}

.card .content {
  font-size: 14px;
  overflow-y: auto;
  cursor: pointer;
}
.card-footer-item {
  font-size: 14px;
  font-weight: 700;
  color: #8f99a3;
}
</style>
