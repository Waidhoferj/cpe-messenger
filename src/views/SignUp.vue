<template>
  <div class="page centered sign-up">
    <loader v-if="loading"></loader>
    <div class="icon" ref="icon">
      <img src="@/assets/letter.svg" alt />
    </div>
    <div class="divider"></div>
    <h1 class="title">CPE Messenger</h1>
    <h3>Sign Up</h3>
    <form @submit.prevent="signUp" ref="form">
      <text-field
        v-model.trim="name"
        @blur="$v.name.$touch()"
        label="Name"
        :invalid="$v.name.$error"
        errorMessage="required"
      ></text-field>
      <text-field
        v-model.trim="email"
        @blur="$v.email.$touch()"
        label="Email"
        :invalid="$v.email.$error"
        errorMessage="enter a valid email"
      ></text-field>
      <text-field
        v-model.trim="password"
        @blur="$v.password.$touch()"
        label="Password"
        :invalid="$v.password.$error"
        errorMessage="must have at least 7 characters"
        type="password"
      ></text-field>
      <text-field
        v-model.trim="code"
        @blur="$v.code.$touch()"
        label="Access Code"
        :invalid="$v.code.$error"
        errorMessage="required"
        type="password"
      ></text-field>
      <input type="submit" style="display: none" />
    </form>
    <button class="primary" ref="submitButton" @click="signUp">Sign Up</button>
  </div>
</template>

<script>
import Loader from "@/components/Loader";
import TextField from "@/components/TextField";
import { required, email, minLength } from "vuelidate/lib/validators";
import { animateEl } from "@/modules/anim";
export default {
  components: {
    Loader,
    TextField
  },
  data() {
    return {
      name: "",
      email: "",
      password: "",
      code: "",
      loading: false
    };
  },
  methods: {
    async signUp() {
      this.$v.$touch();
      if (this.$v.$error) return animateEl(this.$refs.submitButton, "shake");
      return;
      this.loading = true;
      let userInfo = {
        displayName: this.name,
        email: this.email,
        password: this.password,
        code: this.code
      };
      await this.$store.dispatch("signUpUser", userInfo);
      this.loading = false;
      this.$router.push("/");
    }
  },
  validations: {
    name: {
      required
    },
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(7)
    },
    code: {
      required
    }
  }
};
</script>

<style lang="scss"></style>
