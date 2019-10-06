<template>
  <div class="upload-component">
    <div class="popup" :class="{validating: file}">
      <transition name="fade">
        <img src="@/assets/file-icon.svg" class="file-icon" v-if="!file" />
        <form v-else class="validation">
          <h3>Upload</h3>
          <input type="text" v-model="groupName" placeholder="Group Name" />
          <ul class="number-list">
            <li class="number" v-for="number in phoneNumbers" :key="number">{{number}}</li>
          </ul>
          <div class="actions">
            <img src="@/assets/back-icon.svg" alt="back" @click="$emit('close')" />
            <img src="@/assets/confirm-icon.svg" alt="confirm" @click="addGroup" />
          </div>
        </form>
      </transition>
    </div>
  </div>
</template>

<script>
import { parseCSV, parseKeyFrom } from "@/modules/groupParser";
export default {
  props: ["file"],
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
          console.log({ numbers });
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
  }
};
</script>

<style lang="scss">
.popup {
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.7);
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  background: var(--dark);
  pointer-events: none;
  transition: border-radius 1s, transform 1s;

  &.validating {
    border-radius: 15px;
    pointer-events: all;
    transform: scale(1) translate(-50%, -50%);
  }

  .file-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .validation {
    h3 {
      font-size: 35px;
      color: white;
    }

    input {
      background: transparent;
      border: none;
      border-bottom: var(--dark);
      color: white;
      font-size: 25px;
      margin: auto;
      text-align: center;

      &::placeholder {
        color: rgba(255, 255, 255, 0.514);
      }
    }

    .number-list {
      width: 90%;
      height: 40%;
      margin: auto;
      overflow-y: scroll;
      padding: 0;
      margin-top: 10px;

      .number {
        display: inline-block;
        color: white;
        border: 1px solid white;
        padding: 7px;
        border-radius: 5px;
        margin: 10px;
      }
    }
    .actions {
      width: 100%;
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
</style>