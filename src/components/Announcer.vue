<template>
  <div class="announcer-component" :class="{'anim-send': isSending}">
    <header>
      <h2 class="title">Announcement</h2>
      <h3 class="selected-group" @click="selectingGroup = !selectingGroup">To: {{selectedGroup}}</h3>
    </header>
    <section>
      <transition name="downslide">
        <div v-if="!selectingGroup" class="editor">
          <textarea class="message-field" v-model="message"></textarea>
          <div class="task-bar">
            <svg
              class="clock-icon"
              :class="{scheduled}"
              width="50"
              height="50"
              xmlns="http://www.w3.org/2000/svg"
              @click="schedule.isScheduling = true"
            >
              <g id="time-icon" fill="none" fill-rule="evenodd">
                <g id="Group-5" transform="translate(6 6)">
                  <circle
                    id="Oval"
                    stroke="#325C6F"
                    stroke-width="3.2"
                    fill="#325C6F"
                    cx="18.5"
                    cy="18.5"
                    r="18.5"
                  />
                  <path
                    id="Path-22"
                    stroke="#FFF"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    d="M19 7v11.952L25 23"
                  />
                </g>
              </g>
            </svg>
            <img src="@/assets/send-icon.svg" alt="Send" @click="sendMessage" />
            <div class="char-count">
              <h4>{{charactersRemaining}}</h4>
              <p>left</p>
            </div>
          </div>
        </div>
      </transition>
      <ul class="categories">
        <li
          class="category"
          v-for="category in groups"
          :key="category"
          @click="selectGroup"
        >{{category}}</li>
      </ul>
      <transition name="downslide">
        <div class="scheduler" v-if="schedule.isScheduling">
          <div class="scheduler-content">
            <calendar @update:date="schedule.date = $event"></calendar>
            <input type="time" class="schedule-time" v-model="schedule.time" />
            <img
              src="@/assets/confirm-icon.svg"
              alt="Confirm"
              class="schedule-confirm"
              @click="schedule.isScheduling = false"
            />
          </div>
          <img
            class="schedule-back"
            src="@/assets/back-icon.svg"
            alt="Back"
            @click="cancelSchedule"
          />
        </div>
      </transition>
    </section>
  </div>
</template>

<script>
import Calendar from "@/components/Calendar";
import { parseKeyFrom } from "@/modules/groupParser";
export default {
  components: {
    Calendar
  },
  data() {
    return {
      message: "",
      selectedGroup: "",
      selectingGroup: false,
      schedule: {
        isScheduling: false,
        date: "",
        time: ""
      },
      charsPerMessage: 160,
      isSending: false
    };
  },
  computed: {
    charactersRemaining() {
      return (
        this.charsPerMessage - (this.message.length % this.charsPerMessage)
      );
    },
    groups() {
      return this.$store.state.groupNames;
    },
    scheduled() {
      return this.schedule.date && this.schedule.time;
    }
  },
  methods: {
    sendMessage() {
      if (!this.message.length) return;
      let [month, day, year] = this.schedule.date.split("/");
      let [hour, minute] = this.schedule.time.split(":");
      const timestamp = this.scheduled
        ? new Date(year, month - 1, day, hour, minute, 0).getTime()
        : Date.now();
      const message = {
        text: this.message,
        group: parseKeyFrom(this.selectedGroup),
        timestamp,
        sent: false
      };
      this.animateSend();
      this.$store
        .dispatch("sendMessage", message)
        .then(() => console.log("sent message"));
    },
    animateSend() {
      let duration =
        parseInt(
          getComputedStyle(this.$el).getPropertyValue("--send-duration")
        ) * 1000;
      console.log({ duration });
      this.isSending = true;
      return new Promise(resolve => {
        setTimeout(() => (this.message = ""), duration / 2);
        setTimeout(() => resolve((this.isSending = false)), duration);
      });
    },
    selectGroup(event) {
      this.selectedGroup = event.target.innerText;
      this.selectingGroup = false;
    },
    cancelSchedule() {
      this.schedule.isScheduling = false;
      this.schedule.time = "";
      this.schedule.date = "";
    }
  },
  mounted() {
    this.selectedGroup = this.groups[0];
  }
};
</script>

<style lang="scss">
.announcer-component {
  --send-duration: 2s;

  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--accent);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  box-shadow: 0px 7px 38px rgba(0, 0, 0, 0.16);

  &.anim-send {
    animation: anim-send var(--send-duration) ease-in-out;
  }
  .title {
    font-size: 40px;
    color: white;
  }

  .selected-group {
    cursor: pointer;
    font-size: 30px;
    color: white;
  }

  section {
    position: relative;
    width: 100%;
    height: 100%;

    .editor {
      position: relative;
      z-index: 1;
      background-color: var(--card);
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;

      .message-field {
        font-family: inherit;
        font-size: 20px;
        padding: 20px;
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: none;
        resize: none;
      }
      .task-bar {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        height: 60px;
        display: flex;
        width: 100%;

        img,
        svg {
          cursor: pointer;
        }
        .clock-icon.scheduled circle {
          stroke: var(--accent) !important;
          fill: var(--accent) !important;
        }

        .char-count {
          text-align: center;

          h4 {
            margin: 0;
          }

          p {
            font-size: 13px;
            width: 70px;
            margin: 0;
            color: var(--dark);
          }
        }
      }
    }

    .categories {
      z-index: 0;
      position: absolute;
      width: 100%;
      top: 0;
      text-align: center;
      list-style: none;
      padding: 0;

      .category {
        font-size: 20px;
        cursor: pointer;
        margin: 10px 0;
        color: white;
        letter-spacing: inherit;
        transition: letter-spacing 0.7s;

        &:hover {
          letter-spacing: 3px;
        }
      }
    }

    .scheduler {
      position: absolute;
      top: 0;
      z-index: 2;
      background-color: var(--dark);
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 8px;

      .scheduler-content {
        text-align: center;
      }

      .schedule-time {
        background: none;
        border: none;
        color: white;
        font-size: 25px;
        font-family: inherit;
      }

      .schedule-confirm {
        cursor: pointer;
        display: block;
        margin: auto;
        margin-top: 15px;
      }

      .schedule-back {
        cursor: pointer;
        width: 30px;
        position: absolute;
        bottom: 20px;
        left: 20px;
      }
    }
  }
}

//ANIMATIONS
//-----------------------------------------

.downslide-enter-active,
.downslide-leave-active {
  transition: transform 0.7s;
}

.downslide-enter,
.downslide-leave-to {
  transform: translateY(100%);
}

@keyframes anim-send {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(0) scale(0.7);
    opacity: 1;
  }
  50% {
    transform: translateY(-100vh) scale(0.7);
    opacity: 0;
  }
  51% {
    transform: translateY(0) scale(0.95);
    opacity: 0;
  }

  71% {
    transform: translateY(0) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>