<template>
  <div class="centered-page sign-up">
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
        <p>Your account should be ready in a couple of minutes</p>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style lang="scss">
</style>