<template>
  <div class="errors-page page">
    <div v-if="!dates.length" class="no-errors-message">
      <h2>Looking good! No errors here!</h2>
    </div>
    <section class="date-group" v-for="date in dates" :key="date">
      <h3 class="date-title">{{date}}</h3>
      <hr />
      <div class="errors">
        <div
          class="error"
          v-for="error in date"
          :key="error.timestamp"
          @click="inspectError(error)"
        >
          {{error.context}}
          <span class="time">{{(new Date(error.timestamp)).toLocaleTimeString()}}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  computed: {
    errors() {
      return this.$store.state.errors;
    },
    dates() {
      return Object.keys(this.errors);
    }
  },
  methods: {
    inspectError(error) {
      console.log(this.errors);
      console.log("Error Object:", error.metadata);
    }
  }
};
</script>
    
<style lang="scss">
.errors-page {
  .no-errors-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    h2 {
      font-size: 30px;
    }
  }
  .date-group {
    .date-title {
      text-align: left;
      font-size: 25px;
      font-weight: 500;
      color: var(--dark);
      margin: 0;
    }
    hr {
      width: 90%;
      margin: auto;
      border-color: var(--dark);
    }
    .errors {
      margin: auto;
      width: 75%;
      display: flex;

      .error {
        border-radius: 7px;
        cursor: pointer;
        margin: 15px;
        padding: 10px;
        max-width: 500px;
        background: red;
        color: white;
      }
    }
  }
}
</style>