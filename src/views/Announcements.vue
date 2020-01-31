<template>
  <div class="page with-sidebar announcement-page">
    <div class="content">
      <announcer class="announcer"></announcer>
      <div class="queue">
        <h2 v-if="announcementQueue.length">Queue</h2>
        <h3 class="empty-message" v-else>No messages in queue</h3>
        <transition-group name="queue" mode="out-in" tag="div" class="messages">
          <queued-message v-for="msg in announcementQueue" :announcement="msg" :key="msg.timestamp"></queued-message>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import Announcer from "@/components/Announcer";
import QueuedMessage from "@/components/QueuedMessage.vue";
export default {
  components: {
    Announcer,
    QueuedMessage
  },
  computed: {
    announcementQueue() {
      return this.$store.state.announcementQueue.sort(
        (a, b) => a.timestamp - b.timestamp
      );
    }
  }
};
</script>

<style lang="scss">
.announcement-page {
  display: flex;
  align-items: center;
  justify-content: center;
  .content {
    display: grid;
    grid-column-gap: 80px;
    grid-row-gap: 20px;
    grid-template-rows: repeat(2, 40vh);
    grid-template-columns: repeat(2, 40vw);
    grid-template-areas:
      "widget1 widget2"
      "widget1 widget3";
  }

  .announcer {
    grid-area: widget1;
  }

  .queue {
    width: 80%;
    margin: 0 auto;
    grid-area: widget2;
    max-height: 90%;

    h2 {
      text-align: left;
      font-size: 32px;
      font-weight: 500;
      margin-bottom: 15px;
    }

    .empty-message {
      font-weight: 500;
    }

    .messages {
      display: block;
      height: 100%;
      position: relative;
      overflow-y: scroll;
    }

    &-enter,
    &-leave-to {
      transform: scale(0.8);
      opacity: 0;
    }

    &-enter-active,
    &-leave-active,
    &-move {
      transition: all 0.7s;
    }
    &-leave-active {
      position: absolute;
      z-index: 0;
    }
  }
}

@media screen and (max-width: 900px) {
  .announcement-page {
    .content {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
