<template>
  <div class="page conversations-page">
    <div class="content">
      <div class="recipients">
        <ul class="recipient-list">
          <li
            class="recipient"
            v-for="conversation in conversations"
            :class="{selected: conversation.from === selectedConversation.from}"
            @click="selectedConversation = conversation"
            :key="conversation.from"
          >{{conversation.from}}</li>
        </ul>
      </div>
      <div class="conversation" ref="conversation">
        <transition-group name="anim-message">
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
export default {
  components: {
    Message
  },
  data() {
    return {
      selectedConversation: {},
      message: ""
    };
  },
  computed: {
    conversations() {
      return this.$store.state.conversations;
    }
  },
  watch: {
    "selectedConversation.messages": function() {
      setTimeout(() => this.scrollDownConversation(true), 200);
    }
  },
  methods: {
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
      // this.selectedConversation.messages.push(message);
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .content {
    display: grid;
    grid-template-rows: 80vh 100px;
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

        li {
          cursor: pointer;
          font-size: 25px;
          border-bottom: 2px solid white;
          padding: 20px 0;

          &.selected {
            color: var(--accent);
          }
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

  .anim-message-enter {
    transform: translateY(20px);
    opacity: 0;
  }

  .anim-message-leave-to {
    transform: scale(0.9);
    opacity: 0;
  }

  .anim-message-enter-active,
  .anim-message-leave-active {
    transition: transform 0.7s, opacity 0.5s;
  }

  .anim-message-leave-active {
    position: absolute;
  }
}
</style>


