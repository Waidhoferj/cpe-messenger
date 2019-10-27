<template>
  <div class="login-page">
    <div v-if="loading" class="loader"></div>
    <div class="login-container">
      <div class="icon" ref="icon">
        <img src="@/assets/letter.svg" alt />
      </div>
      <div class="divider"></div>
      <h1 class="title">CPE Messenger</h1>
      <h3>{{signUpOpen ? 'Sign up' : "Login"}}</h3>
      <form @submit.prevent="signUpOpen ? signUp() : logIn()" ref="form">
        <input v-if="signUpOpen" type="text" placeholder="Name" v-model="name" />
        <input type="text" class="username" v-model="username" placeholder="Email" />
        <input type="password" class="password" v-model="password" placeholder="Password" />
        <input v-if="signUpOpen" type="password" v-model="code" placeholder="Entry Code" />
        <input type="submit" style="display: none" />
      </form>
      <button
        class="button-primary"
        @click="signUpOpen ? signUp() : logIn()"
      >{{signUpOpen ? "Sign up" : "Login"}}</button>
      <button
        class="button-secondary"
        @click="signUpOpen = !signUpOpen"
      >{{signUpOpen ? 'Login' : "Sign up"}}</button>
    </div>
    <transition name="sign-up-confirmation-popup" mode="out-in">
      <div v-if="popupShown" class="sign-up-confirmation-popup">
        <h3>Thanks for signing up!</h3>
        <p>You're account should be ready in a couple of minutes</p>
      </div>
    </transition>
  </div>
</template>

<script>
import { delay, animateEl } from "@/modules/anim";
export default {
  data() {
    return {
      name: "",
      username: "",
      password: "",
      code: "",
      signUpOpen: false,
      popupShown: false,
      loading: false
    };
  },
  computed: {
    inputsIncomplete() {
      return !this.username || !this.password;
    }
  },
  methods: {
    async logIn() {
      //TODO: add load state
      let showError = () => {
        let inputs = this.$refs.form.querySelectorAll("input");
        inputs.forEach(el => animateEl(el, "shake"));
        this.loading = false;
      };
      if (this.inputsIncomplete) {
        showError();
        return alert("Please fill out all fields.");
      }
      this.loading = true;
      let payload = {
        email: this.username,
        password: this.password
      };
      try {
        await this.$store.dispatch("logIn", payload);
      } catch (err) {
        showError();
        return alert("Incorrect username or password");
      }

      this.loading = false;
      this.$router.push("announcement");
    },
    async signUp() {
      if (!this.name || !this.username || !this.password || !this.code) {
        alert("Please fill out all fields");
        return;
      }
      if (this.password.length < 7) {
        alert("Passwords must have at least 7 characters");
        return;
      }
      let userInfo = {
        displayName: this.name,
        email: this.username,
        password: this.password,
        code: this.code
      };
      this.$store.dispatch("signUpUser", userInfo);
      await delay(500);
      this.displayPopup();
      await delay(1000);
      this.signUpOpen = false;
    },
    async displayPopup() {
      this.popupShown = true;
      await delay(3000);
      this.popupShown = false;
    }
  }
};
</script>

<style lang="scss">
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;

  .loader {
    $border: 3px solid var(--dark);
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left: $border;
    border-right: $border;
    border-bottom: $border;
    animation: spin 1s infinite;
    transform-origin: center;
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }

  .login-container {
    position: relative;
    width: 490px;
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
      font-size: 50px;
      font-weight: 500;
    }
    input {
      background: whitesmoke;
      border-radius: 10px;
      color: var(--dark);
      text-align: center;
      margin: 10px auto;
      font-family: inherit;
      display: block;
      border: none;
      padding: 7px;
      width: 100%;
      font-size: 23px;
      width: 370px;

      &:-webkit-autofill {
        font-size: 25px;
      }

      &.shake {
        animation: shake 1s;
      }
    }
  }

  .sign-up-confirmation-popup {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: whitesmoke;
    padding: 15px;
    box-shadow: 0 0 31px 3px rgba(0, 0, 0, 0.219);

    &.enter-active,
    &.leave-active {
      transition: all 1s;
    }

    &.enter,
    &.leave-to {
      opacity: 0;
      transform: translateY(-200%);
    }
  }
}
</style>