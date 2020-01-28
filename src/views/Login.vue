<template>
  <div class="page centered login">
    <loader v-if="loading"></loader>
    <div class="login-container">
      <div class="icon" ref="icon">
        <img src="@/assets/letter.svg" alt />
      </div>
      <div class="divider"></div>
      <h1 class="title">CPE Messenger</h1>
      <h3>Login</h3>
      <form @submit.prevent="logIn" ref="form">
        <text-field
          v-model.trim="email"
          @blur="$v.email.$touch()"
          label="Email"
          :invalid="$v.email.$error"
          errorMessage="enter a valid email address"
        ></text-field>
        <text-field
          v-model.trim="password"
          @blur="$v.password.$touch()"
          type="password"
          label="Password"
          :invalid="$v.password.$error"
        ></text-field>
        <input type="submit" style="display: none" />
      </form>
      <button class="primary" ref="submitButton" @click="logIn">Send It</button>
      <button class="button-secondary" @click="$router.push('/signup')">
        Sign Up
      </button>
    </div>
  </div>
</template>

<script>
import TextField from "@/components/TextField";
import Loader from "@/components/Loader";
import { delay, animateEl } from "@/modules/anim";
import { required, email } from "vuelidate/lib/validators";
export default {
  components: {
    TextField,
    Loader
  },
  data() {
    return {
      email: "",
      password: "",
      loading: false
    };
  },
  methods: {
    async logIn() {
      //TODO: add load state
      this.$v.$touch();
      if (this.$v.$error) return animateEl(this.$refs.submitButton, "shake");
      this.loading = true;
      let payload = {
        email: this.email,
        password: this.password
      };
      try {
        await this.$store.dispatch("logIn", payload);
      } catch (err) {
        return alert(err.message);
      }

      this.loading = false;
      this.$router.push("announcements");
    }
  },
  validations: {
    email: {
      email,
      required
    },
    password: {
      required
    }
  }
};
</script>

<style lang="scss">
.login {
  .login-container {
    position: relative;
    width: 100%;
    max-width: 490px;
    height: auto;

    .icon img {
      margin: auto;
    }
    .divider {
      width: 100%;
      height: 1px;
      //   border-radius: 2px;
      background-color: var(--dark);
      margin: auto;
    }

    .title {
      font-size: 40px;
      font-weight: 500;
    }

    .text-field {
      margin: auto;
    }

    button.primary {
      margin-top: 30px;
    }
  }
}
</style>
