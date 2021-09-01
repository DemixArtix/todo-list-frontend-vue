<template lang="pug">
  div( id="app" class="position-relative")
    div(
      class="links d-flex mt-2 px-2"
      :class="[ windowWidth > 512 ? ['large-window'] : 'small-window']"
      )
      router-link(v-if="$route.name !== 'Home'" :to="{name : 'Home'}")
        b-button(variant="outline-success" v-b-tooltip.right.hover title="To home page")
          b-icon(icon="house")
      router-link(v-if="$route.name === 'Login'" :to="{name : 'Register'}")
        b-button(variant="outline-success" v-b-tooltip.right.hover title="To registration page")
          b-icon(icon="person-plus")
      router-link(v-if="$route.name === 'Register'" :to="{name : 'Login'}")
        b-button(variant="outline-success" v-b-tooltip.right.hover title="To login page")
          b-icon(icon="box-arrow-in-right")
      a(v-if="$route.name === 'Home'" @click="onLogOut")
        b-button( variant="outline-success" v-b-tooltip.right.hover title="Logout")
          b-icon(icon="box-arrow-right")
    router-view
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    mounted() {
      this.windowWidth = window.innerWidth;
      window.addEventListener('resize', () => this.windowWidth = window.innerWidth );
      if(localStorage.getItem('accessToken')) {
        if(this.$route.name !== 'Home') {
          this.$router.replace({ name: "Home"})
        }
      } else if(this.$route.name !== 'Login') {
        this.$router.replace({ name: "Login"})
      }
    },
    data: () => ({
      windowWidth: null,
    }),
    computed: {

    },
    methods: {
      ...mapActions(['onLogOut'])
    }
  }
</script>

<style lang="scss">

  #app {
    .container {
      max-width: 1200px;
    }
    .links {
      & > * {
      }
      & > *:not(:last-child) {
        margin-right: 20px;
        margin-bottom: 5px;
      }
    }
    .large-window {
      position: sticky;
      left: 0;
      top: 0;
      padding-top: 10px;
      flex-direction: column;
    }
    .small-window {
      justify-content: center;
    }
  }
  .tooltip {
    .tooltip-inner {
      margin-left: 5px;
      background-color: rgba(#198754, .5);
      font-size: 13px;
    }
  }



</style>
