<template>
  <div
    class="group-popup"
    @drop.prevent.stop="getPhoneNumbers"
    @dragenter="dragInFile"
    @dragleave="$emit('close')"
    @dragover.prevent
  >
    <div class="backdrop" @click="$emit('close')"></div>
    <div class="choice-popup" v-if="state == 'choose'" :class="{dragging: isDragging}">
      <img src="@/assets/file-icon.svg" class="file-icon" />
      <ul class="choices" v-if="!isDragging">
        <li @click="state = 'add'">Add to Existing Group</li>
        <li @click="state = 'create'">Create New Group</li>
      </ul>
    </div>
    <div class="form-popup creation-popup" v-else-if="state == 'create'">
      <form class="validation" @submit.prevent>
        <input class="group-name" type="text" v-model="groupName" placeholder="Group Name" />
        <h4 class="count">{{memberCount}}</h4>
        <div class="spacer">
          <ul class="number-list">
            <li
              class="number"
              v-for="number in phoneNumbers"
              :key="number"
            >{{number | formatPhoneNumber}}</li>
          </ul>
          <div class="actions">
            <div style="display:flex; justify-content:center;">
              <member-adder @numberInput="addNumber"></member-adder>
            </div>
            <div class="bar">
              <img src="@/assets/dark-confirm-icon.svg" alt="confirm" @click="addGroup" />
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-else-if="state == 'add'" class="form-popup adding-popup">
      <h2>Choose a Group</h2>
      <ul class="groups">
        <li
          v-for="group in groupNames"
          :key="group"
          @click="addMembers(group)"
        >{{group | parseNameFrom}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  parseCSV,
  parseKeyFrom,
  formatPhoneNumber,
  parseNameFrom
} from "@/modules/parser";
import MemberAdder from "@/components/MemberAdder";
export default {
  components: {
    MemberAdder
  },
  data() {
    return {
      /**
       * States include:
       * choose: choice popup is shown
       * create: creation popup is shown
       * add: add popup is shown
       */
      state: "create",
      isDragging: false,
      phoneNumbers: [],
      groupName: ""
    };
  },
  computed: {
    memberCount() {
      let len = this.phoneNumbers.length;
      if (len > 1) {
        return `${len} members`;
      } else if (len === 1) {
        return `${len} member`;
      } else {
        return "Add members below";
      }
    },
    groupNames() {
      return this.$store.state.groupNames;
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    addNumber(number) {
      if (this.phoneNumbers.includes(number)) return;
      this.phoneNumbers.push(number);
    },
    async addGroup() {
      if (!this.phoneNumbers.length || !this.groupName)
        return alert("Please fill out group name and add members.");
      await this.$store
        .dispatch("createTextGroup", {
          name: parseKeyFrom(this.groupName),
          data: this.phoneNumbers
        })
        .catch(err => {
          console.error(err);
          alert("Sorry, the group cant be created at this time");
        });
      this.$emit("close");
    },
    addMembers(group) {
      this.$store.dispatch("addGroupMembers", {
        group,
        members: this.phoneNumbers
      });
      this.$emit("close");
    },
    dragInFile() {
      this.isDragging = true;
      this.state = "choose";
    },
    async getPhoneNumbers(event) {
      event.preventDefault();
      this.isDragging = false;
      const { files } = event.dataTransfer;
      let numbers = await this.parseFile(files[0]);
      if (!numbers.length)
        return alert("Could not parse phone numbers from this file.");
      this.phoneNumbers = numbers;
    },

    parseFile(file) {
      let reader = new FileReader();
      return new Promise(resolve => {
        reader.onload = () => {
          reader.onload = null;
          let numbers = parseCSV(reader.result);
          resolve(numbers);
        };
        reader.readAsText(file);
      });
    }
  },
  filters: {
    formatPhoneNumber,
    parseNameFrom
  }
};
</script>

<style lang="scss">
@mixin abs-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.group-popup {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 3;
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.267);
  }

  .form-popup {
    @include abs-center;
    width: 95vw;
    max-width: 550px;
    height: 80vh;
    max-height: 550px;
    background: whitesmoke;
    border-radius: 15px;

    transition: all 1s;
  }

  .choice-popup {
    @include abs-center;
    width: 80vw;
    max-width: 600px;
    height: 80vh;
    max-height: 600px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    transition: all 1s;

    &.dragging {
      pointer-events: none;
    }

    .choices {
      list-style: none;
      padding: 0;

      li {
        color: gray;
        cursor: pointer;
        font-size: 25px;
        margin: 15px auto;
      }
    }
  }
  .creation-popup {
    .validation {
      height: 100%;
      display: flex;
      flex-direction: column;
      .group-name {
        margin-top: 25px;
        font-size: 35px;
      }

      input {
        font-family: inherit;
        color: var(--dark);
        background: transparent;
        border: none;
        border-bottom: var(--dark);
        font-size: 25px;
        margin: auto;
        text-align: center;
      }

      .spacer {
        display: flex;
        height: 100%;
        flex-direction: column;
      }

      .number-list {
        width: 90%;
        height: 100%;
        overflow-y: scroll;
        padding: 0;
        margin: 15px auto;

        .number {
          display: inline-block;
          border: 1px solid var(--dark);
          padding: 7px;
          border-radius: 5px;
          margin: 10px;
        }
      }
      .actions {
        width: 100%;
        .bar {
          display: flex;
          justify-content: center;
          padding: 20px 0;
          img {
            cursor: pointer;
            margin: 0 10px;
          }
        }
      }
    }
  }

  .adding-popup {
    h2 {
      font-size: 35px;
      margin-top: 60px;
    }

    .groups {
      margin: auto;
      list-style: none;
      padding: 0;
      li {
        font-size: 22px;
        cursor: pointer;
        color: var(--dark);
        margin: 15px auto;
        letter-spacing: inherit;
        transition: letter-spacing 0.7s;

        &:hover {
          letter-spacing: 2px;
        }
      }
    }
  }
}
</style>