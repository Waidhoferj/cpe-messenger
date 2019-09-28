<template>
  <div class="page announcement-page">
    <div class="content">
      <announcer class="announcer"></announcer>
      <notifications class="notifications"></notifications>
      <event-calendar class="event-calendar"></event-calendar>
    </div>
  </div>
</template>

<script>
import Announcer from "@/components/Announcer";
import EventCalendar from "@/components/EventCalendar";
import Notifications from "@/components/Notifications";
export default {
  components: {
    Announcer,
    EventCalendar,
    Notifications
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
    grid-column-gap: 20px;
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

  .notifications {
    grid-area: widget2;
  }
  .event-calendar {
    grid-area: widget3;
  }
}
</style>