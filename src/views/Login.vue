<template>
  <div class="login-page">
    <div class="login-container">
      <div class="icon">
        <img src="@/assets/letter.svg" alt />
      </div>
      <div class="divider"></div>
      <h1 class="title">CPE Messenger</h1>
      <input type="text" class="username" v-model="username" />
      <input type="password" class="password" v-model="password" />
      <button class="login-button" @click="logIn">Log in</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: ""
    };
  },
  computed: {
    inputsIncomplete() {
      return !this.username || !this.password;
    }
  },
  methods: {
    logIn() {
      if (this.inputsIncomplete) return alert("Please fill out all fields.");
      let payload = {
        email: this.username,
        password: this.password
      };
      this.$store
        .dispatch("logIn", payload)
        .then(() => this.$router.push("announcement"));
      //TODO: Uncomment when you start to use auth

      //   this.$store.dispatch("logIn", payload).then(res => {
      //     this.$router.push("announcement");
      //   });
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

  .login-container {
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
      color: var(--dark);
      text-align: center;
      font-family: inherit;
      display: block;
      background: transparent;
      border: none;
      width: 100%;
      font-size: 25px;

      &:-webkit-autofill {
        font-size: 25px;
      }
    }

    .login-button {
      cursor: pointer;
      margin-top: 35px;
      padding: 10px;
      font-size: 23px;
      background: var(--dark);
      color: white;
      border-radius: 5px;
      border: none;
    }
  }
}
</style>