<template>
  <div id="app">
    <transition name="slide">
      <div
        v-if="showMenu"
        @mouseenter="menuOpen = true"
        @mouseleave="menuOpen = false"
        @click="menuOpen = !menuOpen"
        :class="{open: menuOpen}"
        class="menu"
      >
        <img src="./assets/logo.svg" class="logo" />
        <router-link tag="div" to="/announcement" class="option">
          <img src="./assets/announcement-icon.svg" alt="img" />
          <h3 v-show="menuOpen" class="menu-desc">Announcement</h3>
        </router-link>
        <router-link tag="div" to="/record" class="option">
          <img src="./assets/conversation-icon.svg" alt="img" />
          <h3 class="menu-desc" v-show="menuOpen">Conversations</h3>
        </router-link>
        <router-link tag="div" to="/validate" class="option">
          <img src="./assets/groups-icon.svg" alt="img" />
          <h3 class="menu-desc" v-show="menuOpen">Groups</h3>
        </router-link>
        <router-link tag="div" to="/" class="option logout" @click="$store.commit('clearData')">
          <img src="@/assets/back-icon.svg" alt="Log out" />
          <h3 class="menu-desc" v-show="menuOpen" style="white-space: nowrap">Log out</h3>
        </router-link>
      </div>
    </transition>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showMenu: false,
      menuOpen: false
    };
  },
  watch: {
    $route(to, from) {
      console.log("from", from);
      this.showMenu = to.name !== "login";
    }
  }
};
</script>


<style lang="scss">
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

#app {
  //Color Palette:
  --dark: #325c6f;
  --accent: #df8162;
  --background: #ffffff;
  --card: #f9f9f9;
  --sidebar-width: 110px;

  font-family: "Montserrat", Helvetica, Arial, sans-serif;
  font-weight: 500;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--dark);
}

/* Menu */
.menu {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: 90px;
  height: 100%;
  background: var(--dark);
  padding: 0 10px;
  transition: width 0.7s;
  overflow: hidden;
  .logo {
    margin: 10px 0;
  }
  .option {
    display: flex;
    align-items: center;
    text-align: center;
    cursor: pointer;
    padding: 10px;
    margin: 5px 0;
    transition: opacity 0.7s;

    img {
      width: 50px;
      padding: 0 10px;
    }

    &:hover > .menu-desc {
      color: var(--accent);
    }

    .menu-desc {
      margin: 0;
      color: white;
      padding-left: 10px;
      font-size: 1.5rem;
      text-align: left;
      transition: color 0.5s;
    }

    &.logout {
      position: absolute;
      bottom: 20px;
      left: 10px;
    }
  }

  &.open {
    width: 300px;
  }
}

.page {
  position: relative;
  width: calc(100vw - var(--sidebar-width));
  height: 100vh;
  margin-left: var(--sidebar-width);
}

.visual-box {
  width: 100%;
  height: 100%;
  background: gray;
  border: white 5px solid;
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
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-120%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.7s;
}
</style>
