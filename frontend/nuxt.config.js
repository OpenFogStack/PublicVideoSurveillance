module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: "watchyourfac.es",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "description",
        name: "description",
        content: "Frontend for fog computing project 2018"
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico"
      },
      {
        rel: "stylesheet",
        type: "text/css",
        href:
          "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons"
      },
      {
        rel: "stylesheet",
        href:
          "https://cdn.materialdesignicons.com/2.4.85/css/materialdesignicons.min.css"
      }
    ]
  },
  /*
   ** Customize the progress bar color
   */
  loading: {
    color: "#338078"
  },
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
    postcss: {
      plugins: {
        "postcss-custom-properties": {
          warnings: false
        }
      },
      vendor: ["file-saver"]
    }
  },
  modules: ["nuxt-buefy", "@nuxtjs/axios", "@nuxtjs/auth"],
  auth: {
    redirect: {
      login: "/login",
      logout: "https://watchyourfac.es",
      callback: "/callback",
      home: "/dashboard"
    },
    strategies: {
      auth0: {
        domain: "tu-fog-computing.eu.auth0.com",
        client_id: "mewWruC9mQEj9salyw1c2Te5qa31cXYs",
        response_type: "token id_token",
        token_key: "id_token",
        custom_login_params: {
          nonce: 1234,
          audience: "https://tu-fog-computing.eu.auth0.com/api/v2/"
        }
      }
    }
  },
  axios: {
    port: 4000
  },

  buefy: {
    css: false
  },
  mode: "spa",
  /*
   ** Load plugins into the app
   */
  plugins: [
    {
      src: "~/plugins/vue-plugins.js",
      ssr: false
    },
    "~/plugins/axios",
    "~/plugins/filters.js"
  ],
  /*
   ** Load CSS globally
   */
  css: ["~assets/styles/bulma_config.scss", "~assets/styles/base.scss"],

  router: {
    middleware: ["auth"]
  }
};
