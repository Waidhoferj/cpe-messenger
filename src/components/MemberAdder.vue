<template>
  <div class="member-adder" @click="buttonClick" :class="{selected: addingMember}">
    <h3
      class="member-text"
      contenteditable="true"
      @click="addingMember ? $event.stopPropagation() : ''"
      @keydown.enter="$event.preventDefault()"
      @keyup.enter="submit"
      @blur="buttonBlur"
      ref="input"
    >Add Member</h3>
    <button v-show="addingMember" class="submit" @click="submit">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff">
        <path d="M363 277h-86v86h-42v-86h-86v-42h86v-86h42v86h86v42z" />
        <path
          d="M256 90c44.3 0 86 17.3 117.4 48.6C404.7 170 422 211.7 422 256s-17.3 86-48.6 117.4C342 404.7 300.3 422 256 422c-44.3 0-86-17.3-117.4-48.6C107.3 342 90 300.3 90 256c0-44.3 17.3-86 48.6-117.4C170 107.3 211.7 90 256 90m0-42C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
import { animateEl } from "@/modules/anim";
export default {
  data() {
    return {
      /**Indicates whether user is interacting with component */
      addingMember: false
    };
  },
  methods: {
    /**
     * Toggles on interaction and focuses input field
     */
    buttonClick(e) {
      if (this.addingMember) return;
      this.addingMember = true;
      this.$refs.input.innerText = "";
      this.$refs.input.focus();
    },
    /**
     * Sends input data to parent component after ensuring that the input value is a phone number.
     */
    submit(e) {
      e.stopPropagation();
      let { input } = this.$refs;
      let nonDigit = /\D/g;
      let digits = input.innerText.replace(nonDigit, "").trim();

      let notValidNumber =
        digits.length < 10 || (digits.length === 11 && digits[0] !== "1");
      if (notValidNumber) return animateEl(this.$el, "shake");
      if (digits.length === 10) digits = "1" + digits;
      this.$emit("numberInput", digits);

      this.$refs.input.innerText = "Add Member";
      this.addingMember = false;
    },
    /**
     * Resets button to untouched state
     */
    buttonBlur(e) {
      if (this.$refs.input.innerText.trim() !== "") return;
      this.$refs.input.innerText = "Add Member";
      this.addingMember = false;
    }
  }
};
</script>

<style lang="scss">
.member-adder {
  display: flex;
  align-items: center;
  border-radius: 20px;
  background: var(--accent);
  margin: 0 10px;
  padding: 15px;
  cursor: pointer;
  &.shake {
    animation: shake 1s;
  }
  &.selected {
    cursor: default;
  }

  .member-text {
    margin: 0;
    color: white;
    background: var(--accent);
  }
  .submit {
    margin: 0;
    margin-left: 10px;
    padding: 0;
    width: 25px;
    border: none;
    background: transparent;
    cursor: pointer;
  }
}
</style>