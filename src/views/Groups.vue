<template>
  <div
    class="page groups-page"
    @dragenter="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop.prevent.stop="getDroppedFiles"
  >
    <div class="groups-selector">
      <div
        v-for="(group, index) in groupNames"
        :key="group"
        class="group"
        :class="{selected: index === selectedIndex}"
        @click="selectGroup(index)"
      >{{group | parseNameFrom}}</div>
    </div>
    <div class="search">
      <img src="@/assets/search-icon.svg" class="search-icon" />
      <input type="text" class="search-input" v-model="searchQuery" />
    </div>
    <div class="group-options">
      <h3 class="option add-group" @click="showUploadPopup = true">Add Group</h3>
      <member-adder @numberInput="addMember"></member-adder>
    </div>
    <p class="member-count">{{selectedGroup.length}} Members</p>
    <div class="group-members">
      <div v-for="member in filteredMembers" :key="member" class="member">
        <img
          src="@/assets/delete-icon.svg"
          alt="remove"
          class="remove-icon"
          @click="removeMember(member)"
        />
        <div class="member-tag">{{member | formatPhoneNumber}}</div>
      </div>
    </div>
    <transition name="fade">
      <group-popup
        v-if="showUploadPopup"
        :dragging="draggingInFile"
        :file="uploadFile"
        @close="closePopup"
      ></group-popup>
    </transition>
  </div>
</template>

<script>
import {
  parseNameFrom,
  formatPhoneNumber,
  parseDigits
} from "@/modules/parser";
import GroupPopup from "@/components/GroupPopup";
import MemberAdder from "@/components/MemberAdder";
export default {
  name: "groups",
  components: {
    GroupPopup,
    MemberAdder
  },
  data() {
    return {
      selectedGroup: [],
      selectedIndex: 0,
      searchQuery: "",
      showUploadPopup: false,
      draggingInFile: false,
      uploadFile: null
    };
  },
  computed: {
    groups() {
      return this.$store.state.groups;
    },
    groupNames() {
      return Object.keys(this.groups);
    },
    filteredMembers() {
      let digits = parseDigits(this.searchQuery);
      return this.searchQuery.length > 0
        ? this.selectedGroup.filter(member => member.includes(digits))
        : this.selectedGroup;
    },
    memberTransition() {
      return this.selectedGroup.length < 75 ? "member" : "";
    }
  },
  methods: {
    selectGroup(index) {
      this.selectedGroup = this.groups[this.groupNames[index]];
      this.selectedIndex = index;
    },
    addMember(member) {
      this.$store.dispatch("addGroupMember", {
        member,
        group: this.groupNames[this.selectedIndex]
      });
    },
    removeMember(member) {
      this.$store
        .dispatch("removeGroupMember", {
          group: this.groupNames[this.selectedIndex],
          member
        })
        .catch(err => console.error("Could not delete member:", err));
      let removeIndex = this.selectedGroup.indexOf(member);
      this.selectedGroup.splice(removeIndex, 1);
    },
    getDroppedFiles(event) {
      event.preventDefault();
      this.draggingInFile = false;
      let fileTest = event.dataTransfer.items[0].getAsFile();
      const { files } = event.dataTransfer;
      this.uploadFile = files[0];
    },
    closePopup() {
      this.uploadFile = null;
      this.showUploadPopup = false;
    },

    onDragEnter() {
      this.draggingInFile = this.showUploadPopup = true;
    },

    onDragLeave() {
      this.draggingInFile = this.showUploadPopup = false;
    }
  },
  filters: {
    parseNameFrom,
    formatPhoneNumber
  },
  mounted() {
    if (this.groupNames.length) {
      let i = 0;
      this.selectedIndex = i;
      this.selectedGroup = this.groups[this.groupNames[i]];
    } else {
      this.$store.dispatch("getGroupListings").then(() => {
        if (this.groupNames.length) {
          let i = 0;
          this.selectedIndex = i;
          this.selectedGroup = this.groups[this.groupNames[i]];
        }
      });
    }
  }
};
</script>

<style lang="scss">
.groups-page {
  .groups-selector {
    display: flex;
    justify-content: center;
    overflow-x: scroll;
    flex-wrap: nowrap;
    margin: auto;
    padding: 50px 0;
    width: 70%;
    min-width: 500px;
    .group {
      margin: 0 15px;
      white-space: nowrap;
      flex: 0, 0 auto;
      cursor: pointer;
      font-size: 30px;
      color: var(--dark);
      opacity: 0.5;
      transition: opacity 0.5s;

      &.selected {
        opacity: 1;
      }
    }
  }

  .search {
    display: flex;
    justify-content: center;
    align-items: center;
    .search-icon {
      width: 30px;
    }
    .search-input {
      font-family: inherit;
      color: inherit;
      background: transparent;
      font-size: 22px;
      border: none;
      border-bottom: 2px solid var(--dark);
    }
  }
  .group-options {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;

    .option {
      margin: 0 10px;
      padding: 15px;
      border-radius: 20px;
      background: var(--dark);
      cursor: pointer;
      color: white;
    }
    .add-member {
      background: var(--accent);
      &.shake {
        animation: shake 1s;
      }
    }
  }

  .member-count {
    margin: 0;
    margin-top: 20px;
    font-weight: 700;
    font-size: 20px;
  }

  .group-members {
    margin: auto;
    margin-top: 20px;
    padding: 20px;
    width: 90%;
    max-width: 1000px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .member {
      z-index: 1;
      display: block;
      position: relative;
      margin: 22px;

      .remove-icon {
        cursor: pointer;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 0;
      }

      .member-tag {
        position: relative;
        z-index: 1;
        border-radius: 7px;

        padding: 15px 10px;
        background: var(--accent);
        color: white;
        transition: transform 0.7s;
      }

      &:hover > .member-tag {
        transform: translateX(40px);
      }
    }
  }
}
</style>