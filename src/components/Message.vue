<template>
  <div class="message-container" :class="{'from-messenger': isFromMessenger}">
    <div class="message">{{text}}</div>
  </div>
</template>

<script>
export default {
  props: {
    isFromMessenger: Boolean,
    text: String
  }
};
</script>

<style lang="scss">
.message-container {
  padding: 5px 20px;
  color: white;
  width: 100%;
  text-align: left;

  &.from-messenger {
    text-align: right;
  }

  .message {
    display: inline-block;
    text-align: left;
    border-radius: 15px;
    font-size: 17px;
    background: var(--accent);
    padding: 15px;
    max-width: 60%;
  }
}
</style>