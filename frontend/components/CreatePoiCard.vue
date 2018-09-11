<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        Start a new Facehunt
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <div class="control">
          <b-field
            :type="this.$v.id.$error ? 'is-danger' : this.$v.id.$dirty? 'is-success': ''"
            :message="this.$v.id.$error ? inputMessage('id','Id'): ''"
            label="Id">
            <b-input
              v-model.trim="$v.id.$model"
              type="text"
              minlength="5"
              maxlength="12"
              placeholder="abc123"/>
          </b-field>
          <b-field
            :type="this.$v.firstName.$error ? 'is-danger' : this.$v.firstName.$dirty? 'is-success': ''"
            :message="this.$v.firstName.$error ? inputMessage('firstName', 'First Name'): ''"
            label="First Name">
            <b-input
              v-model.trim="$v.firstName.$model"
              type="text"
              minlength="2"
              placeholder="Peter"/>
          </b-field>
          <b-field
            :type="this.$v.lastName.$error ? 'is-danger' : this.$v.lastName.$dirty? 'is-success': ''"
            :message="this.$v.lastName.$error ? inputMessage('lastName', 'Last Name'): ''"
            label="Last Name">
            <b-input
              v-model.trim="$v.lastName.$model"
              type="text"
              minlength="2"
              placeholder="Lustig"/>
          </b-field>
          <b-field
            label="Reason"
            message="Optional" >
            <b-input
              v-model.trim="$v.reason.$model"
              type="text"
              placeholder="Why not"/>
          </b-field>
          <b-field
            label="Description"
            message="Optional">
            <b-input
              v-model.trim="$v.description.$model"
              type="text"
              placeholder="170cm tall"/>
          </b-field>
          <!-- <image-upload
            :images="images"
            @add-image="images = $event"/> -->
        </div>

        <div class="control">
          <button
            :disabled="formStatus === 'PENDING'"
            :class="{'is-loading': formStatus === 'PENDING'}"
            class="button is-primary"
            @click="createPOI">Start Facehunt</button>
        </div>
      </div>
      <article
        v-if="formStatus === 'ERROR'"
        class="message is-danger form-error">
        <div class="message-body">
          Please fill out all required fields!
        </div>
      </article>
    </div>
</div></template>

<script>
import { required, minLength, helpers } from "vuelidate/lib/validators";
import ImageCompressor from "image-compressor.js";
import ImageUpload from "~/components/ImageUpload";

const imageCompressor = new ImageCompressor();

export default {
  components: { ImageUpload },
  data() {
    return {
      id: "",
      firstName: "",
      lastName: "",
      reason: "",
      description: "",
      //images: [],
      formStatus: null
    };
  },
  validations: {
    id: {
      required,
      minLength: minLength(5),
      //this does not allow $ % ^ . * , € = £ @ - ! " § & / \ | ? (){}[] : ; # ' + or spaces in Ids
      idValidator: helpers.regex(
        "idValidator",
        /^[^\$%\^\.\ -,*£=~@€!"$&\/\\|\(\)\{\}\[\]\?:;#'+]+$/
      )
    },
    firstName: {
      required,
      minLength: minLength(2),
      //this does not allow $ % ^ * , € = £ @ 1-9 ! " § & / \ | ? (){}[] : ; # ' + in Names
      nameValidator: helpers.regex(
        "nameValidator",
        /^[^\$%\^*£=~@€,!"$&\/\\|\(\)\{\}\[\]\?:;#'+\d]+$/
      )
    },
    lastName: {
      required,
      minLength: minLength(2),
      //this does not allow $ % ^ * , € = £ @ 1-9 ! " § & / \ | ? (){}[] : ; # ' + in Names
      nameValidator: helpers.regex(
        "nameValidator",
        /^[^\$%\^*£=~@€,!"$&\/\\|\(\)\{\}\[\]\?:;#'+\d]+$/
      )
    },
    // images: {
    //   required,
    //   minLength: minLength(1),
    //   $each: {
    //     name: {
    //       required,
    //       minLength: minLength(2)
    //     }
    //   }
    // },
    reason: {},
    description: {}
  },
  computed: {
    idType() {
      return this.$v.id.invalid ? "is-danger" : "is-success";
    }
  },
  created() {
    this.$axios.setToken(this.$auth.$storage.getUniversal("_id_token.auth0"));
  },
  methods: {
    async compressImage(imageFile) {
      const options = {
        maxHeight: 1920
      };
      return imageCompressor.compress(imageFile, options);
    },
    inputMessage(field, friendlyname) {
      const messages = [];
      if (this.$v[field].required) {
        messages.push(`${friendlyname} is required`);
        if (this.$v[field].minLength === false) {
          messages.push(
            `${friendlyname} must have at least ${
              this.$v[field].$params.minLength.min
            } characters`
          );
        }
        if (this.$v[field].idValidator === false) {
          messages.push(
            `${friendlyname} must not contain spaces or special characters`
          );
        }
        if (this.$v[field].nameValidator === false) {
          messages.push(
            `${friendlyname} must not contain numbers or special characters`
          );
        }
      }
      return messages;
    },
    resetForm() {
      this.id = "";
      this.firstName = "";
      this.lastName = "";
      this.reason = "";
      this.description = "";
      this.formStatus = null;
      this.images = [];
      // super weird fix to reset the input validation of the form, for some reason doing it synchronously
      // does not reset the forms validation
      setTimeout(() => this.$v.$reset(), 10);
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = error => reject(error);
      });
    },
    async uploadImages(poiId) {
      for (const image of this.images) {
        const compressed = await this.compressImage(image);
        const imageResult = await this.$axios.$post("/api/images", {
          poiId,
          image: await this.getBase64(compressed)
        });
        const poi = await this.$axios.$put(`/api/pois/${poiId}`, {
          imageId: imageResult.result.image.imageId
        });
      }
    },
    async createPOI() {
      this.$v.$reset();
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.formStatus = "ERROR";
        return;
      }
      this.formStatus = "PENDING";
      this.$toast.open({
        duration: 1000,
        message: `<div class="toastMsg"><i class="material-icons">hourglass_empty</i> Creating new PoI ...</div>`,
        position: "is-bottom",
        type: "is-primary"
      });
      try {
        const newPoi = await this.$axios.$post("/api/pois", {
          id: this.id,
          firstName: this.firstName,
          lastName: this.lastName,
          reason: this.reason,
          description: this.description
        });
        //  await this.uploadImages(this.id);
        this.$toast.open({
          message: `<div class="toastMsg"><i class="material-icons">done</i> Successfully created facehunt for ${
            this.firstName
          } ${this.lastName}. Waiting for approval...</div>`,
          position: "is-bottom",
          type: "is-success"
        });
        this.resetForm();
        this.$emit("submit-poi");
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
        this.resetForm();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.form-error {
  margin: 10px 0;
}
</style>
