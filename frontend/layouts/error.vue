<template>
  <section
    v-if="error.statusCode === 404"
    class="error">
    <div>
      <div id="page">
        <div id="main">
          <div id="code">
            <p>
              404
            </p>
          </div>
          <div id="msg">
            <p>
              We can find anyone. But not this page.
            </p>
          </div>
          <div id="back">
            <nuxt-link to="/">
              <a class="button1">Back to Safety</a>
            </nuxt-link>
          </div>
        </div>
        <div id="footer">
          <img
            id="footer-image"
            src="~assets/404bw.png">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Navbar from "~/components/Navbar";
export default {
  components: { Navbar },
  props: {
    error: {
      type: Object,
      default: null
    }
  }
};
</script>

<style>
#__nuxt {
  height: 100%;
}
#__layout {
  height: 100%;
}
.error {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #338078;
  font-family: "Lucida Console", Monaco, monospace;
  overflow: hidden;
  text-align: center;
}

#footer {
  bottom: 0;
  margin: 0;
  width: 100%;
  position: absolute;
  text-align: center;
  align-items: center;
  z-index: 0;
}

#footer-image {
  max-width: 100%;
  z-index: 0;
}

#main {
  color: white;
  z-index: 9999;
  display: flex;
  position: relative;
  justify-content: space-around;
  flex-direction: column;
  height: 60vh;
}

#code {
  font-size: 10em;
  line-height: 0vh;
  margin-top: 50px;
}

#msg {
  font-size: 3em;
}
.error {
  margin-top: 10px;
}
a.button1 {
  display: inline-block;
  padding: 0.35em 1.2em;
  border: 0.1em solid #ffffff;
  margin: 0 0.3em 0.3em 0;
  border-radius: 0.12em;
  box-sizing: border-box;
  text-decoration: none;
  font-weight: 300;
  color: #ffffff;
  text-align: center;
  transition: all 0.2s;
}

a.button1:hover {
  color: #000000;
  background-color: #ffffff;
}

@media all and (max-width: 30em) {
  a.button1 {
    display: block;
    margin: 0.4em auto;
  }
}
</style>
