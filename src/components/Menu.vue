<template>
  <div
    @mouseenter="menuOpen = true"
    @mouseleave="menuOpen = false"
    @click="menuOpen = !menuOpen"
    :class="{open: menuOpen}"
    class="menu"
  >
    <img src="./assets/logo.svg" class="logo" />
    <router-link tag="div" to="/announcements" class="option">
      <img src="./assets/announcement-icon.svg" alt="img" />
      <h3 v-show="menuOpen" class="menu-desc">Announcements</h3>
    </router-link>
    <router-link tag="div" to="/conversations" class="option">
      <img src="./assets/conversation-icon.svg" alt="img" />
      <h3 class="menu-desc" v-show="menuOpen">Conversations</h3>
    </router-link>
    <router-link tag="div" to="/groups" class="option">
      <img src="./assets/groups-icon.svg" alt="img" />
      <h3 class="menu-desc" v-show="menuOpen">Groups</h3>
    </router-link>
    <router-link tag="div" to="/" class="option logout" @click="$store.commit('logOut')">
      <img src="@/assets/back-icon.svg" alt="Log out" />
      <h3 class="menu-desc" v-show="menuOpen" style="white-space: nowrap">Log out</h3>
    </router-link>
  </div>
</template>

<script>
export default {
  data() {
      return {
          menuOpen: false;
      }
  }
};
</script>

<style lang="scss">
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
</style>