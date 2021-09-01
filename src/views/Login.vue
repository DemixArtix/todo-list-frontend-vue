<template lang="pug">
  section(class="login container")
    b-form(@submit.prevent="onLogin" @reset="onReset" class="col-md-4 col-sm-10 col p-1 m-auto")
      h2(class="login__title") Login
      b-form-group(
        id="email-group"
        class="mb-2"
        label="Email address:"
        label-for="email"
        label-align="start")
        b-form-input(
        id="email"
        v-model="form.email"
        type="email"
        placeholder="Enter email"
        required)
      b-form-group(
        id="password-group"
        class="mb-1"
        label="Password:"
        label-for="password"
        label-align="start"
        )
        b-form-input(
        id="password"
        v-model="form.password"
        type="password"
        placeholder="Enter password"
        required)
      div(v-if="message" class="invalid-feedback d-block mb-3") {{message}}
      div(class="row")
        div(class="col")
          b-button(type="submit" variant="success" class="w-100") Submit
        div(class="col")
          b-button(type="reset" variant="dark" class="w-100") Cancel
</template>

<script>
  import { api } from "../api";
  import { mapActions } from 'vuex'

  export default {
    name: "Login",
    data: () => ({
      form: {
        email: null,
        password: null,
      },
      message : null
    }),
    methods: {
      ...mapActions(['AUTH_REQUEST']),
      async onLogin() {
        this.message = null;
        await this['AUTH_REQUEST'](this.form).then((res) => {
          console.log(res);
          const {success, message} = res;
          success ? this.$router.push({name: 'Home'}) : this.message = message;

        });

      },
      onReset() {

      }
    }
  }
</script>

<style scoped>

</style>