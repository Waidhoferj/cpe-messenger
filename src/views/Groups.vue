<template>
  <div
    class="page groups-page"
    @dragenter="showUploadPopup = true"
    @dragover.prevent
    @dragleave="showUploadPopup = false"
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
    <div class="group-members">
      <div v-for="member in filteredMembers" :key="member" class="member">
        <img
          src="@/assets/delete-icon.svg"
          alt="remove"
          class="remove-icon"
          @click="removeMember(member)"
        />
        <div class="member-tag">{{member}}</div>
      </div>
    </div>
    <transition name="fade">
      <upload-popup v-if="showUploadPopup" :file="uploadFile" @close="closePopup"></upload-popup>
    </transition>
  </div>
</template>

<script>
import { parseNameFrom } from "@/modules/groupParser";
import UploadPopup from "@/components/UploadPopup";
export default {
  name: "groups",
  components: {
    UploadPopup
  },
  data() {
    return {
      groups: {},
      selectedGroup: [],
      selectedIndex: 0,
      searchQuery: "",
      showUploadPopup: false,
      uploadFile: null
    };
  },
  computed: {
    groupNames() {
      return Object.keys(this.groups);
    },
    filteredMembers() {
      return this.searchQuery.length > 0
        ? this.selectedGroup.filter(member => member.includes(this.searchQuery))
        : this.selectedGroup;
    }
  },
  methods: {
    selectGroup(index) {
      this.selectedGroup = this.groups[this.groupNames[index]];
      this.selectedIndex = index;
    },
    removeMember(member) {
      //TODO:delete in server
      let removeIndex = this.selectedGroup.indexOf(member);
      this.selectedGroup.splice(removeIndex, 1);
    },
    getDroppedFiles(event) {
      event.preventDefault();
      let fileTest = event.dataTransfer.items[0].getAsFile();
      console.log("files: ", fileTest);
      const { files } = event.dataTransfer;
      this.uploadFile = files[0];
      console.log(this.uploadFile);
    },
    closePopup() {
      this.uploadFile = null;
      this.showUploadPopup = false;
    }
  },
  filters: {
    parseNameFrom
  },
  mounted() {
    this.$store
      .dispatch("getGroupListings")
      .then(groups => (this.groups = groups));

    if (this.groupNames.length) {
      let i = 0;
      this.selectedIndex = i;
      this.selectedGroup = this.groups[this.groupNames[i]];
    }
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

      &:hover > .member-tag {
        transform: translateX(40px);
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
    }
  }
}
</style>