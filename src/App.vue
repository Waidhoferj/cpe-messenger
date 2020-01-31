<template>
  <div id="app">
    <transition name="slide">
      <app-menu v-if="showMenu"></app-menu>
    </transition>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import AppMenu from "@/components/Menu";
export default {
  components: {
    AppMenu
  },
  data() {
    return {
      showMenu: false
    };
  },
  watch: {
    $route(to, from) {
      let screensWithoutSidebar = ["login", "signUp", "default"];
      this.showMenu = !screensWithoutSidebar.includes(to.name);
    }
  }
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
}

#app {
  //Color Palette:
  --dark: #325c6f;
  --accent: #df8162;
  --background: #ffffff;
  --card: #f9f9f9;
  --sidebar-width: 90px;
  height: 100%;

  font-family: "Montserrat", Helvetica, Arial, sans-serif;
  font-weight: 500;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--dark);
}

.page {
  position: relative;
  width: 100%;
  height: 100%;
}

.with-sidebar {
  width: calc(100vw - var(--sidebar-width));
  margin-left: var(--sidebar-width);
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

button {
  font-size: 17px;
  display: block;
  padding: 10px 60px;
  margin: 10px auto;
  border-radius: 20px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid white;
  transition: transform 0.5s;

  &.primary {
    font-size: 20px;
    background: var(--dark);
    color: white;
  }
  &.secondary {
    background: transparent;
    border: 2px solid white;
    color: white;
  }

  &.shake {
    animation: shake 0.5s;
  }

  &:active {
    transform: scale(0.95);
  }
}

//ANIMATIONS
//-----------------------------
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
  pointer-events: none;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-120%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.7s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0px);
  }
  20%,
  60% {
    transform: translateX(20px);
  }
  40%,
  80% {
    transform: translateX(-20px);
  }
}
</style>
