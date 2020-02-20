<template>
  <div class="page with-sidebar conversations-page">
    <div class="content">
      <div class="recipients">
        <ul class="recipient-list">
          <li
            class="recipient"
            v-for="conversation in conversations"
            :class="{
              selected: convoSelectable(conversation)
            }"
            @click="selectConversation(conversation)"
            :key="conversation.from"
            :contenteditable="convoSelectable(conversation)"
            @blur="updateNickname($event, conversation)"
            @keyup.enter="enterNickname"
            @keydown.enter="$event.preventDefault()"
          >
            <div v-if="conversation.unread" class="unread-icon"></div>
            {{ conversation.nickname || formatPhoneNumber(conversation.from) }}
          </li>
        </ul>
      </div>
      <div class="conversation" ref="conversation" :class="{slide: revealBackPanel}">
        <div class="menu-bar">
          <h3
            class="menu-bar-title"
            @click="revealBackPanel = true"
          >{{ selectedConversation.nickname || formatPhoneNumber(selectedConversation.from) }}</h3>
          <img
            class="icon"
            src="@/assets/exit-icon.svg"
            alt="remove group"
            @click="groupRemoverClicked"
          />
          <div v-if="showMembership" class="group-remover-menu">
            <p
              v-for="group in selectedMembership"
              :key="group"
              @click="removeMember(group)"
            >{{ group }}</p>
          </div>
          <img class="icon" src="@/assets/delete-icon.svg" alt="delete" @click="deleteConversation" />
        </div>
        <transition-group name="message" class="messages" tag="div">
          <message
            v-for="message in selectedConversation.messages"
            :key="message.timestamp"
            :text="message.text"
            :isFromMessenger="message.sender === 'messenger'"
          ></message>
        </transition-group>
      </div>
      <div class="response-bar" :class="{slide: revealBackPanel}">
        <div
          class="message-input"
          contenteditable="true"
          @input="message = $event.target.innerText"
          @keyup.enter="sendMessage"
          @keydown.enter="$event.preventDefault()"
          ref="messageInput"
        ></div>
        <button class="send-button" @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import Message from "@/components/Message";
import { formatPhoneNumber } from "@/modules/parser";
export default {
  components: {
    Message
  },
  data() {
    return {
      selectedConversation: {},
      message: "",
      selectedMembership: [],
      showMembership: false,
      revealBackPanel: false
    };
  },
  computed: {
    conversations() {
      const byTime = (c1, c2) =>
        c1.messages[c1.messages.length - 1].timestamp >
        c2.messages[c2.messages.length - 1].timestamp
          ? -1
          : 1;
      return this.$store.state.conversations.sort(byTime);
    }
  },
  watch: {
    "selectedConversation.messages": function() {
      setTimeout(() => this.scrollDownConversation(true), 200);
    }
  },
  methods: {
    formatPhoneNumber,
    selectConversation(conversation) {
      this.selectedConversation = conversation;
      this.showMembership = false;
      conversation.unread = false;
      this.revealBackPanel = false;
    },
    sendMessage() {
      const message = {
        sender: "messenger",
        text: this.message.trim(),
        timestamp: Date.now()
      };
      this.$store.dispatch("sendResponse", {
        message,
        recipient: this.selectedConversation.from
      });
      this.message = "";
      this.$refs.messageInput.innerText = "";
    },
    scrollDownConversation(isSmooth = false) {
      let { conversation } = this.$refs;
      let options = {
        left: 0,
        top: conversation.scrollHeight
      };
      isSmooth ? (options.behavior = "smooth") : null;
      conversation.scroll(options);
    },
    /**
     * @param event dom event
     * @param {number} index element index in the conversation array
     */
    updateNickname(event, conversation) {
      let { innerText } = event.target;
      let validNickname = /[A-Za-z]/;
      let nicknameUnchanged =
        conversation.from == innerText ||
        (conversation.nickname && conversation.nickname === innerText);
      if (nicknameUnchanged) return;
      if (validNickname.test(innerText)) {
        conversation.nickname = innerText;
        this.$store.dispatch("updateNickname", conversation);
      } else {
        event.target.innerText =
          conversation.nickname || formatPhoneNumber(conversation.from);
      }
    },
    /**
     * Handles closing the nickname field when enter is pressed
     */
    enterNickname(e) {
      e.target.innerText = e.target.innerText.replace("\n", "");
      e.target.blur();
    },
    async groupRemoverClicked() {
      //TODO: this could be optimized with computed props
      this.showMembership = !this.showMembership;
      if (!this.showMembership) return;
      let groups = this.$store.state.groups;
      let groupNames = Object.keys(groups);
      if (!groupNames.length) {
        await this.$store.dispatch("getGroupListings");
        groups = this.$store.state.groups;
      }
      let membership = [];
      for (let name in groups) {
        if (groups[name].includes(this.selectedConversation.from))
          membership.push(name);
      }
      this.selectedMembership = membership;
    },
    removeMember(group) {
      //TODO: add specified groups
      this.selectedMembership = [];
      this.showMembership = false;
      this.$store.dispatch("removeGroupMember", {
        member: this.selectedConversation.from,
        group
      });
    },
    deleteConversation() {
      this.$store.dispatch("deleteConversation", this.selectedConversation);
      if (this.conversations.length)
        this.selectedConversation = this.conversations[0];
    },
    convoSelectable(conversation) {
      return (
        conversation.from === this.selectedConversation.from &&
        window.innerWidth > 700
      );
    }
  },
  mounted() {
    if (this.conversations.length)
      this.selectedConversation = this.conversations[0];
  }
};
</script>

<style lang="scss">
.conversations-page {
  $menu-bar-height: 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .content {
    display: grid;
    grid-template-rows: 80vh 75px;
    grid-template-columns: 25vw 55vw;
    grid-template-areas:
      "recipients conversation"
      "recipients menu";

    border: 2px solid #eaeaea;

    .recipients {
      $side-border: 1px solid var(--accent);
      width: 100%;
      height: 100%;
      grid-area: recipients;
      background: var(--card);
      max-height: 100%;
      overflow-y: scroll;

      .recipient-list {
        margin: 0;
        list-style: none;
        padding: 10px;
        height: 100%;
        overflow-y: scroll;

        .recipient {
          position: relative;
          cursor: pointer;
          font-size: 25px;
          border-bottom: 2px solid white;
          padding: 20px 0;

          &.selected {
            color: var(--accent);
          }

          .unread-icon {
            position: absolute;
            background: var(--accent);
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 15px;
            height: 15px;
            opacity: 0.8;
            border-radius: 50%;
          }
        }
      }
    }

    .menu-bar {
      height: $menu-bar-height;
      position: fixed;
      display: flex;
      justify-content: flex-end;
      padding: 10px;
      background: white;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.034);

      .menu-bar-title {
        display: none;
        font-size: 20px;
        margin: 0;
        margin: auto;
        margin-left: 60px;
        cursor: pointer;
      }
      .icon {
        width: 40px;
        cursor: pointer;
        margin: 0 10px;
      }

      .group-remover-menu {
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translateY(100%);
        background: white;
        padding: 10px;
        border: 2px solid whitesmoke;
        border-radius: 0px 0px 7px 7px;

        p {
          cursor: pointer;
        }
      }
    }

    .messages {
      padding-top: $menu-bar-height + 5px;
      .message {
        z-index: 1;

        &-enter {
          transform: translateY(20px);
          opacity: 0;
        }

        &-leave-to {
          transform: scale(0.9);
          opacity: 0;
        }

        &-enter-active,
        &-leave-active {
          transition: all 0.7s;
        }

        &-leave-active {
          position: absolute;
          z-index: 0;
        }
      }
    }

    .response-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: min-content;
      padding: 10px 0;
      border-top: 2px solid whitesmoke;
      background: var(--base);
      grid-area: menu;

      .message-input {
        text-align: left;
        color: var(--base);
        padding: 15px;
        display: block;
        width: 90%;
        background: var(--base);
      }

      .send-button {
        margin: 0 10px;
        padding: 10px;
        color: var(--accent);
        background: transparent;
        border-radius: 0;
        border-color: transparent;
      }
    }

    .conversation {
      position: relative;
      overflow-y: scroll;
      width: 100%;
      height: 100%;
      grid-area: conversation;
      background: white;
    }
  }

  .square {
    width: 40px;
    height: 40px;
    background: red;
  }
}

.slide {
  transform: translateY(120%);
}

//MEDIA QUERIES
@media screen and (max-width: 700px) {
  //TODO: make the conversations tab fill the whole screen
  .conversations-page {
    .content {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;

      .recipients {
        position: fixed;
      }

      .conversation {
        height: calc(100vh - 75px);
        transition: transform 0.7s;
        .menu-bar {
          width: calc(100% - var(--sidebar-width));
          position: fixed;
          top: 0;

          .menu-bar-title {
            display: block;
          }
        }
      }
    }
  }
}
</style>
