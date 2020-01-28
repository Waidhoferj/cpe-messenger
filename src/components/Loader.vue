<template functional>
  <div v-if="loading" class="loader"></div>
</template>

<style lang="scss">
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
</style>
