<template>
  <div class="admin">
    <header-component />
    <div class="container">
      <breadcrumbs :entries="breadcrumbs" />
      <b-modal
        :active.sync="isAddUserModalActive"
        has-modal-card>
        <choose-user-modal
          :all-users="$store.state.users"
          :added-users="poi.users"
          @user-selected="addUser"/>
      </b-modal>
      <b-modal
        :active.sync="isCardModalActive"
        scroll="keep">
        <facehunt-logs-modal
          :poi="poi"/>
      </b-modal>
      <div class="columns is-multiline">
        <div class="column is-6">
          <div class="card events-card">
            <b-loading
              :active.sync="isLoadingDetails"
              :is-full-page="true"/>
            <header class="card-header">
              <div class="card-header-title">
                <p class="title is-4">{{ poi.firstName }} {{ poi.lastName }}</p>
                <p class="subtitle is-6">#{{ poi.id }}</p>
              </div>
              <a
                class="card-header-icon"
                aria-label="more options"
                @click="getPoiData">
                <span class="icon">
                  <i
                    class="mdi mdi-sync mdi-24px"
                    aria-hidden="true"/>
                </span>
              </a>
            </header>
            <div class="card-content">
              <div class="content">
                <ul class="poi-details">
                  <li><em>Description</em>: {{ poi.description }}</li>
                  <li><em>Reason</em>: {{ poi.reason }}</li>
                  <li><em>Started</em>: {{ poi.createdAt | timestamp }}</li>
                  <li v-if="roles.includes('Supervisor')"><a
                    class="button is-primary"
                    @click="openLogs">View Logs</a></li>
                </ul>

              </div>
            </div>
            <footer class="card-footer">
              <a
                class="card-footer-item has-text-danger"
                @click="openDeletePoiDialog(poi.id)"
              >Delete</a>
            </footer>
          </div>


        </div>
        <div
          v-if="roles.includes('Supervisor')"
          class="column is-6">
          <div class="card events-card">
            <header class="card-header">
              <div class="card-header-title">
                Who can see this Facehunt?
              </div>
              <a
                class="card-header-icon"
                aria-label="Create User"
                @click="openAddUserModal">
                <b-icon
                  icon="account-plus"
                />
              </a>
            </header>
            <div class="card-content">
              <minimal-users-list
                :users="poi.users"
                @delete-user="openDeleteUserDialog"/>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="card events-card">
            <header class="card-header">
              <div class="card-header-title">
                Images
              </div>
            </header>

            <div class="card-content images">
              <gallery
                :images="poi.images"
                :index="index"
                :id="'images-gallery'"
                @close="index = null"/>
              <div
                v-for="(image, imageIndex) in poi.images"
                :key="imageIndex"
                :style="{ backgroundImage: 'url(' + image.poster + ')' }"
                class="poi-image"
                @click.self="openImage(imageIndex)"
              >
                <a
                  class="button is-rounded deleteIcon"
                  @click="openDeleteImageDialog(imageIndex)">
                  <b-icon
                    icon="delete"
                    type="is-danger"
                    class="noHover"/>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="card events-card">
            <header class="card-header">
              <div class="card-header-title">
                Footages
              </div>
            </header>

            <div class="card-content images">
              <gallery
                :images="poi.footages"
                :index="footagesIndex"
                :id="'footages-gallery'"
                @close="footagesIndex = null"/>
              <div
                v-for="(footage, footageIndex) in poi.footages"
                :key="footageIndex"
                :style="{ backgroundImage: 'url(' + footage.poster + ')' }"
                class="poi-image"
                @click.self="openFootage(footageIndex)"
              >

                <a
                  class="button is-rounded deleteIcon"
                  @click="openDeleteFootageDialog(footageIndex)">
                  <b-icon
                    icon="delete"
                    type="is-danger"
                    class="noHover"/>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-12">
          <div class="card events-card">
            <header class="card-header">
              <div class="card-header-title">
                Add images
              </div>
            </header>
            <div class="card-content">
              <image-upload
                :images="images"
                @add-image="images = $event" />
              <div class="control">
                <button
                  :disabled="formStatus === 'PENDING'"
                  :class="{'is-loading': formStatus === 'PENDING'}"
                  class="button is-primary"
                  @click="uploadImages">Upload Images</button>
              </div>
            </div>
          </div>
        </div>
      </div>
</div></div></template>

<script>
import ImageCompressor from "image-compressor.js";
import VueGallery from "vue-gallery";

import Header from "~/components/Header";
import Breadcrumbs from "~/components/Breadcrumbs";
import ImageUpload from "~/components/ImageUpload";
import MinimalUsersList from "~/components/MinimalUsersList";
import ChooseUserModal from "~/components/ChooseUserModal";
import FacehuntLogsModal from "~/components/FacehuntLogsModal";

const imageCompressor = new ImageCompressor();
export default {
  components: {
    headerComponent: Header,
    Breadcrumbs,
    gallery: VueGallery,
    ImageUpload,
    MinimalUsersList,
    ChooseUserModal,
    FacehuntLogsModal
  },
  data() {
    return {
      isMenuActive: false,
      poi: {
        id: "",
        firstName: "",
        lastName: "",
        approved: false,
        createdAt: 0,
        description: "",
        reason: "",
        createdBy: "",
        images: [],
        footages: [],
        users: []
      },
      index: null,
      footagesIndex: null,
      breadcrumbs: [
        {
          to: "/dashboard",
          name: "Dashboard"
        },
        {
          to: "/facehunts",
          name: "Facehunts"
        },
        {
          name: this.$route.params.id
        }
      ],
      isCardModalActive: false,
      isAddUserModalActive: false,
      columns: [
        {
          field: "Action",
          label: "Action"
        },
        {
          field: "Actor",
          label: "Actor"
        },
        {
          field: "Time",
          label: "Time"
        }
      ],
      images: [],
      footages: [],
      formStatus: null,
      isLoadingDetails: false
    };
  },
  computed: {
    roles() {
      if (this.$store.state.auth.loggedIn) {
        return this.$store.state.auth.user[
          "https://watchyourfac.es/userAuthorization"
        ].roles;
      } else {
        return [];
      }
    }
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
    this.getPoiData();
  },
  methods: {
    refreshUsers() {
      this.$store.dispatch("refreshUsers");
    },
    async addUser(user) {
      try {
        await this.$axios.$put(`/api/pois/${this.poi.id}/users`, {
          userId: user.user_id
        });
        this.$toast.open({
          duration: 2000,
          message: `<div class="toastMsg"><i class="material-icons">done</i>Added ${
            user.email
          }. Waiting for approval...`,
          position: "is-bottom",
          type: "is-success"
        });
      } catch (err) {
        this.$toast.open({
          duration: 2000,
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          } </div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    openDeleteUserDialog(user) {
      this.$dialog.confirm({
        message: `Are you sure you want to delete <em>${user.email}</em>?`,
        onConfirm: () => this.deleteUser(user.userId),
        confirmText: "Delete User",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deleteUser(userId) {
      try {
        await this.$axios.delete(`/api/pois/${this.poi.id}/users/${userId}`);
        this.$toast.open({
          duration: 2000,
          message: `<div class="toastMsg"><i class="material-icons">done</i> Sucessfully deleted User. Waiting for approval...`,
          position: "is-bottom",
          type: "is-success"
        });
      } catch (err) {
        this.$toast.open({
          duration: 2000,
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          } </div>`,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    async compressImage(imageFile) {
      const options = {
        maxHeight: 1920
      };
      return imageCompressor.compress(imageFile, options);
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = error => reject(error);
      });
    },
    async uploadImages() {
      this.formStatus = "PENDING";
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Uploading images ...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        for (const image of this.images) {
          const compressed = await this.compressImage(image);
          const imageResult = await this.$axios.$post("/api/images", {
            poiId: this.poi.id,
            image: await this.getBase64(compressed)
          });
          const poi = await this.$axios.$put(`/api/pois/${this.poi.id}`, {
            imageId: imageResult.result.image.imageId
          });
        }
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> Uploaded ${
            this.images.length
          } new image(s)`,
          position: "is-bottom",
          type: "is-success"
        });
        this.images = [];
        await this.getPoiData();
      } catch (err) {
        console.log(err);
        this.$toast.open({
          duration: 1000,
          message: `<div class="toastMsg"><i class="material-icons">error</i> ${
            err.message
          } </div>`,
          position: "is-bottom",
          type: "is-danger"
        });
        this.images = [];
      }
      this.formStatus = null;
    },
    closeMenu() {
      this.isMenuActive = false;
    },
    async openLogs() {
      this.isCardModalActive = true;
    },
    async openAddUserModal() {
      this.isAddUserModalActive = true;
      this.refreshUsers();
      this.isLoadingLogs = true;
      this.isLoadingLogs = false;
    },
    openImage(imageIndex) {
      this.index = imageIndex;
    },
    openFootage(imageIndex) {
      this.footagesIndex = imageIndex;
    },
    openDeleteImageDialog(index) {
      this.$dialog.confirm({
        message: `Are you sure you want to delete this image? This cannot be undone and can affect the face recognition quality.`,
        onConfirm: () => this.deleteImage(index),
        confirmText: "Delete Image",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deleteImage(index) {
      try {
        await this.$axios.$delete(
          `/api/pois/${this.poi.id}/images/${this.poi.images[index].imageId}`
        );
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i>Successfully deleted image. Is now waiting for approval.</div>`,
          queue: false,
          position: "is-bottom",
          type: "is-success"
        });
      } catch (error) {
        this.$toast.open({
          message: err.message,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    openDeleteFootageDialog(index) {
      this.$dialog.confirm({
        message: `Are you sure you want to delete this footage?`,
        onConfirm: () => this.deleteFootage(index),
        confirmText: "Delete Footage",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deleteFootage(index) {
      try {
        await this.$axios.$delete(
          `/api/pois/${this.poi.id}/footages/${
            this.poi.footages[index].footageId
          }`
        );
        this.poi.footages.splice(index, 1);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i>Successfully deleted footage</div>`,
          queue: false,
          position: "is-bottom",
          type: "is-success"
        });
      } catch (error) {
        this.$toast.open({
          message: err.message,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    openDeletePoiDialog(Id) {
      this.$dialog.confirm({
        message: `Are you sure you want to delete the facehunt for <b>${
          this.poi.firstName
        } ${this.poi.lastName}</b>? This cannot be undone`,
        onConfirm: () => this.deletePoiById(Id),
        confirmText: "Delete Facehunt",
        type: "is-danger",
        hasIcon: true
      });
    },
    async deletePoiById(Id) {
      try {
        this.$toast.open({
          duration: 1000,
          message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Deleting PoI ...</div>`,
          position: "is-bottom",
          type: "is-primary"
        });
        await this.$axios.$delete(`/api/pois/${Id}`);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> PoI ${Id} deleted</div>`,
          queue: false,
          position: "is-bottom",
          type: "is-success"
        });
        this.$router.push({ path: `/facehunts` });
      } catch (err) {
        console.log(err);
        this.$toast.open({
          message: err.message,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },
    async getPoiData() {
      this.isLoadingDetails = true;
      const id = this.$route.params.id;
      const res = await this.$axios.get(`/api/pois/${id}`);
      const poi = res.data.result.poi;
      this.poi = poi;
      this.poi.images = await this.getImages(id);
      this.poi.footages = await this.getFootages(id);
      if (this.roles.includes("Supervisor")) {
        this.poi.users = await this.getPoiUsers(id);
      } else {
        this.poi.users = [];
      }
      this.isLoadingDetails = false;
    },
    async getImages(id) {
      const images = await this.$axios.get(`/api/pois/${id}/images`);
      return images.data.result.images.map(image => {
        return {
          href: image.imageUrl,
          poster: image.imageUrl,
          type: "image/jpeg"
        };
      });
    },
    async getFootages(id) {
      const footages = await this.$axios.get(`/api/pois/${id}/footages`);
      return footages.data.result.footages.map(footage => {
        const isVideo = footage.footageId.endsWith("-video");
        return {
          href: footage.footageUrl,
          type: isVideo ? "video/mp4" : "image/jpeg",
          poster: isVideo
            ? "https://www.atlantisfood.de/media/image/e6/4a/0e/video_600x600@2x.png"
            : footage.footageUrl
        };
      });
    },
    async getPoiUsers(id) {
      const users = await this.$axios.get(`/api/pois/${id}/users`);
      return users.data.result.users;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/initial-variables";
div.admin {
  font-family: "Open Sans", sans-serif;
}
.columns {
  height: 100%;
}
div.card {
  margin-bottom: 1em;
}
.card-header-title {
  display: block;
}
ul {
  list-style: none;
  margin: 0;
}
div.images {
  padding-top: 50px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 1em;
  max-height: 600px;
  overflow-y: auto;

  @media only screen and (max-width: $tablet) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media only screen and (min-width: $tablet) and (max-width: $desktop) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media only screen and (min-width: $desktop) and (max-width: $widescreen) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  div.poi-image {
    position: relative;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    cursor: pointer;
    &::before {
      content: "";
      display: inline-block;
      width: 1px;
      height: 0;
      padding-bottom: calc(100% / 1);
    }
  }
}

.deleteIcon {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 5px;
  width: 2em;
  height: 2em;
}
</style>
