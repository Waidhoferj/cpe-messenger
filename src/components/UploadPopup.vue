<template>
  <div class="upload-component">
    <div class="popup" :class="{dragging: dragging}">
      <transition name="fade">
        <img src="@/assets/file-icon.svg" class="file-icon" v-if="dragging" />
        <form v-else class="validation">
          <h3 class="title">New Group</h3>
          <input type="text" v-model="groupName" placeholder="Group Name" />
          <ul class="number-list">
            <li
              class="number"
              v-for="number in phoneNumbers"
              :key="number"
            >{{number | formatPhoneNumber}}</li>
          </ul>
          <div class="actions">
            <member-adder @numberInput="addNumber"></member-adder>
            <div class="bar">
              <img src="@/assets/dark-back-icon.svg" alt="back" @click="$emit('close')" />
              <img src="@/assets/dark-confirm-icon.svg" alt="confirm" @click="addGroup" />
            </div>
          </div>
        </form>
      </transition>
    </div>
  </div>
</template>

<script>
import { parseCSV, parseKeyFrom, formatPhoneNumber } from "@/modules/parser";
import MemberAdder from "@/components/MemberAdder";
export default {
  props: ["file", "dragging"],
  components: {
    MemberAdder
  },
  data() {
    return {
      phoneNumbers: [],
      groupName: ""
    };
  },
  watch: {
    file: function() {
      if (!this.file) return;
      let reader = new FileReader();
      new Promise(resolve => {
        reader.onload = () => {
          reader.onload = null;
          let numbers = parseCSV(reader.result);
          resolve(numbers);
        };
        reader.readAsText(this.file);
      }).then(numbers => {
        if (numbers.length) this.phoneNumbers = numbers;
        else {
          alert(
            "Oops, the format you put in isn't correct. Make sure that:\n1. The file is a .csv\n2. Phone numbers have 11 digits\n3. There are only numbers in the phone data"
          );
          this.$emit("close");
        }
      });
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
      let { state, commit, dispatch } = this.$store;

      await dispatch("createTextGroup", {
        name: parseKeyFrom(this.groupName),
        data: this.phoneNumbers
      }).catch(err => {
        console.error(err);
        alert("Sorry, the group cant be created at this time");
      });

      commit("updateGroupNames", [...state.groupNames, this.groupName]);
      this.$emit("close");
    }
  },
  filters: {
    formatPhoneNumber
  }
};
</script>

<style lang="scss">
.popup {
  z-index: 2;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40vw;
  height: 40vw;
  background: whitesmoke;
  border-radius: 15px;
  pointer-events: all;
  transform: scale(1) translate(-50%, -50%);
  box-shadow: 0 0 31px 3px rgba(0, 0, 0, 0.123);
  transition: all 1s;

  &.dragging {
    background: var(--dark);
    pointer-events: none;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0.7);
  }

  .file-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .validation {
    .title {
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

    .number-list {
      width: 90%;
      height: 40%;
      margin: auto;
      overflow-y: scroll;
      padding: 0;
      margin: 15px 0;

      .number {
        display: inline-block;
        border: 1px solid var(--dark);
        padding: 7px;
        border-radius: 5px;
        margin: 10px;
      }
    }
    .actions {
      position: absolute;
      bottom: 0;
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
</style>