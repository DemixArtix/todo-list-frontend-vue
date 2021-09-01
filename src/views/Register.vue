<template lang="pug">
  div(class="reg container")
    b-form(@submit.prevent="onReg" @reset="onReset" class="col-md-4 col-sm-10 col p-1 m-auto")
      h2(class="reg__title") Register
      b-form-group(
        id="email-group"
        class="mb-2"
        label="Email address:"
        label-for="email"
        label-align="start"
        valid-feedback="It's valid email"
        :invalid-feedback="invalidEmail"
        )
        b-form-input(
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter email"
          @blur="$v.email.$touch()"
          :state="validEmail")
      b-form-group(
        id="password-group"
        class="mb-3"
        label="Password:"
        label-for="password"
        label-align="start"
        valid-feedback="It's valid password"
        :invalid-feedback="invalidPassword")
        b-form-input(
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter password"
          @blur="$v.password.$touch()"
          :state="validPassword")
      b-form-group(
        id="password-group"
        class="mb-3"
        label="Confirm password:"
        label-for="confirm-password"
        label-align="start"
        valid-feedback="It's ok"
        :invalid-feedback="invalidConfirmPassword")
        b-form-input(
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          placeholder="Enter password again"
          @blur="$v.confirmPassword.$touch()"
          :state="validConfirmPassword")
      div(class="row")
        div(class="col")
          b-button(type="submit" variant="success" class="w-100") Submit
        div(class="col")
          b-button(type="reset" variant="dark" class="w-100") Cancel
</template>

<script>
  import { email, required } from 'vuelidate/lib/validators';
  import regExp from '@/mixins/regExp'
  import api from '@/api'


  export default {
    name: "Register",
    data: () => ({
      email: null,
      password: null,
      confirmPassword: null,
    }),
    mixins: [regExp],
    validations: {
      email: {
        required,
        email
      },
      password: {
        required,
        strongPassword: function(value) {
          return this.regExpTest(
            value,
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\S+$).{8,}$/
          )
        }
      },
      confirmPassword: {
        required,
        matchingPasswords: function() {
          return this.password === this.confirmPassword
        }
      }
    },
    computed: {
      validEmail() {
        return (!this.$v.email.$invalid) ? true :
          (this.$v.email.$invalid && !this.$v.email.$dirty) ? null : false
      },
      invalidEmail() {
        if(!this.$v.email.email && this.$v.email.$dirty) {
          return 'Email must be in mail@mail.com format'
        } else if(!this.email && this.$v.email.$dirty) {
          return 'Email is required'
        }
      },
      validPassword() {
        return (!this.$v.password.$invalid) ? true :
          (this.$v.password.$invalid && !this.$v.password.$dirty) ? null : false
      },
      invalidPassword() {
        if(!this.password && this.$v.password.$dirty) {
          return 'Password is required'
        } else if(!this.$v.password.strongPassword && this.$v.password.$dirty) {
          return 'Password must contain numbers, upper and lower case letters and at least 8 characters'
        }
      },
      validConfirmPassword() {
        return (!this.$v.confirmPassword.$invalid) ? true :
          (this.$v.confirmPassword.$invalid && !this.$v.confirmPassword.$dirty) ? null : false
      },
      invalidConfirmPassword() {
        if(!this.$v.confirmPassword.matchingPasswords && this.$v.confirmPassword.$dirty) {
          return 'Password mismatch'
        } else if(!this.confirmPassword && this.$v.confirmPassword.$dirty) {
          return 'Please repeat your password'
        }
      }
    },
    methods: {
      async onReg() {
        if(!this.$v.$invalid) {
          await api.post('/register',
            {
                email: this.email, password: this.password
            },
            {
              skipAuth: true
            }
          ).then(res => {
            if(res.status === 201) {
              this.$root.$bvToast.toast(`User created`, {
                duration: 5000,
                variant: 'success'
              });
              this.$router.push({name: 'Login'})
            } else if(res.status === 409) {
              this.$bvToast.toast(`User with the given email already exists` ,{
                duration: 5000,
                variant: 'danger'
              });
            } else if(res.status === 500) {
              this.$bvToast.toast(`Internal Server Error, please try again`, {
                duration: 5000,
                variant: 'danger'
              });
            }
          })
        } else {
          this.$bvToast.toast(`Invalid form`, {
            duration: 5000,
            variant: 'danger'
          });
        }
      },
      onReset() {

      }
    }
  }
</script>

<style scoped>

</style>