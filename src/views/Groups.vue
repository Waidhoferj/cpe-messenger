<template>
  <div
    class="page with-sidebar groups-page"
    @dragenter="showGroupPopup = true"
    @dragover.prevent
  >
    <div class="groups-selector">
      <div
        v-for="(group, index) in groupNames"
        :key="group"
        class="group"
        :class="{ selected: index === selectedIndex }"
        @click="selectGroup(index)"
      >
        {{ group | parseNameFrom }}
      </div>
    </div>
    <div class="search">
      <img src="@/assets/search-icon.svg" class="search-icon" />
      <input type="text" class="search-input" v-model="searchQuery" />
    </div>
    <div class="group-options">
      <h3 class="option add-group" @click="showGroupPopup = true">Add Group</h3>
      <member-adder @numberInput="addMember"></member-adder>
    </div>
    <p class="member-count">{{ memberCount }} Members</p>
    <div class="group-members">
      <div v-for="member in filteredMembers" :key="member" class="member">
        <img
          src="@/assets/delete-icon.svg"
          alt="remove"
          class="remove-icon"
          @click="removeMember(member)"
        />
        <div class="member-tag">{{ member | formatPhoneNumber }}</div>
      </div>
    </div>
    <group-popup
      class="group-popup"
      v-if="showGroupPopup"
      @close="closePopup"
    ></group-popup>
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
      showGroupPopup: false
    };
  },
  computed: {
    groups() {
      return this.$store.state.groups;
    },
    groupNames() {
      return this.$store.state.groupNames;
    },
    filteredMembers() {
      let digits = parseDigits(this.searchQuery);
      return this.searchQuery.length > 0
        ? this.selectedGroup.filter(member => member.includes(digits))
        : this.selectedGroup;
    },
    memberCount() {
      return this.selectedGroup ? this.selectedGroup.length : "";
    }
  },
  methods: {
    selectGroup(index) {
      this.selectedGroup = this.groups[this.groupNames[index]];
      this.selectedIndex = index;
    },
    addMember(member) {
      this.$store.dispatch("addGroupMembers", {
        members: [member],
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

    closePopup() {
      this.showGroupPopup = false;
    },

    ensureGroupLoad() {
      let setUp = () => {
        let i = 0;
        this.selectedIndex = i;
        this.selectedGroup = this.groups[this.groupNames[i]];
      };
      if (this.groups && Object.keys(this.groups).length) {
        setUp();
      } else {
        this.$store.dispatch("getGroupListings").then(() => {
          let groupsExist = Object.keys(this.groups).length;
          if (groupsExist) setUp();
        });
      }
    }
  },
  filters: {
    parseNameFrom,
    formatPhoneNumber
  },
  mounted() {
    this.ensureGroupLoad();
  }
};
</script>

<style lang="scss">
.groups-page {
  .groups-selector {
    display: flex;
    overflow-x: scroll;
    flex-wrap: nowrap;
    margin: auto;
    padding: 50px 0;
    width: min-content;
    max-width: 70%;
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
    display: grid;
    grid-template-columns: repeat(auto-fill, 200px);
    justify-content: center;
    margin: auto;
    margin-top: 20px;
    padding: 20px;
    width: 95%;
    max-width: 1000px;

    .member {
      display: block;
      position: relative;
      z-index: 1;
      margin: 22px;
      white-space: nowrap;

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
