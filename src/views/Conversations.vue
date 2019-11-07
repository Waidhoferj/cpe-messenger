<template>
  <div class="page conversations-page">
    <div class="content">
      <div class="recipients">
        <ul class="recipient-list">
          <li
            class="recipient"
            v-for="conversation in conversations"
            :class="{selected: conversation.from === selectedConversation.from}"
            @click="selectConversation(conversation)"
            :key="conversation.from"
            :contenteditable="conversation.from === selectedConversation.from"
            @blur="updateNickname($event, conversation)"
            @keyup.enter="enterNickname"
            @keydown.enter="$event.preventDefault()"
          >
            <div v-if="conversation.unread" class="unread-icon"></div>
            {{conversation.nickname || formatPhoneNumber(conversation.from)}}
          </li>
        </ul>
      </div>
      <div class="conversation" ref="conversation">
        <div class="menu-bar">
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
            >{{group}}</p>
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
      <div class="response-bar">
        <div
          class="message-input"
          contenteditable="true"
          @input="message = $event.target.innerText"
          @keyup.enter="sendMessage"
          ref="messageInput"
        ></div>
        <img
          v-show="message"
          class="send-icon"
          src="@/assets/send-icon.svg"
          alt="send"
          @click="sendMessage"
        />
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
      showMembership: false
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
      let nicknameUnchanged =
        conversation.from == innerText ||
        (conversation.nickname && conversation.nickname === innerText);

      if (nicknameUnchanged) return;
      conversation.nickname = innerText;
      this.$store.dispatch("updateNickname", conversation);
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
        console.log("fetched");
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
      this.$store.dispatch("deleteConversation", {
        conversation: this.selectedConversation
      });
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
    grid-template-rows: 80vh min-content;
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
      height: 55px;
      background: white;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.034);
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
      width: 100%;
      height: 100%;
      padding: 10px 0;
      grid-area: menu;

      .message-input {
        color: var(--accent);
        border-radius: 15px;
        border: 2px solid var(--accent);
        padding: 15px;
        display: inline-block;
        min-width: 70%;
        max-width: 100%;
        transition: min-width 0.7s;

        &:focus {
          min-width: 53px;
        }
      }

      .send-icon {
        margin: auto;
        display: block;
        width: 40px;
        margin-top: 15px;
        cursor: pointer;
      }
    }

    .conversation {
      position: relative;
      overflow-y: scroll;
      width: 100%;
      height: 100%;
      grid-area: conversation;
    }
  }

  .square {
    width: 40px;
    height: 40px;
    background: red;
  }
}
</style>


