<template>
  <div class="queued-message">
    <img
      src="@/assets/delete-icon.svg"
      alt="remove"
      class="remove-icon"
      @click="$store.dispatch('deleteAnnouncement', announcement)"
    />
    <div class="message">
      <div class="info">
        <div class="group">{{announcement.group | parseNameFrom}}</div>
        <div class="time">{{sendTime}}</div>
      </div>
      <div class="bubble">{{announcement.text}}</div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { parseNameFrom } from "@/modules/parser";
export default {
  props: {
    announcement: Object
  },
  computed: {
    sendTime() {
      let dateTime = moment(this.announcement.timestamp);
      return dateTime.format("ddd MMM DD - hh:mm a");
    }
  },
  filters: {
    parseNameFrom
  }
};
</script>

<style lang="scss">
.queued-message {
  position: relative;
  width: 100%;
  margin: 15px 0;

  .remove-icon {
    cursor: pointer;
    position: absolute;
    left: 10px;
    top: calc(50% + 10px);
    transform: translateY(-50%);
    z-index: 0;
  }

  .message {
    position: relative;
    width: max-content;
    max-width: 100%;
    z-index: 1;
    transition: transform 0.7s;
    .info {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .group,
      .time {
        font-size: 17px;
        font-weight: 500;
        white-space: nowrap;
        margin: 0 10px;
      }
    }
    .bubble {
      color: white;
      text-align: left;
      font-size: 15px;
      background: var(--accent);
      border-radius: 15px;
      padding: 10px;
      width: fit-content;
    }
  }

  &:hover > .message {
    transform: translateX(40px);
  }
}
</style>